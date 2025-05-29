import { createServerMutators } from '@/mutators/server'
import type { AuthData } from '@/server/db/zero-permissions'
import { schema } from '@/server/db/zero-schema.gen'
import {
	PostgresJSConnection,
	PushProcessor,
	ZQLDatabase,
} from '@rocicorp/zero/pg'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import postgres from 'postgres'

// Create a single postgres client at module scope
// This client will be reused across all requests
const sql = process.env.ZERO_UPSTREAM_DB
	? postgres(process.env.ZERO_UPSTREAM_DB, {
			max: 10, // Increase pool size for better concurrency
			idle_timeout: 30, // Close idle connections after 30 seconds
			ssl: false,
		})
	: null

// Create a single PushProcessor instance at module scope
const database = sql
	? new ZQLDatabase(new PostgresJSConnection(sql), schema)
	: null
const processor = database ? new PushProcessor(database) : null

// Count active connections for monitoring
async function getConnectionCount() {
	if (!sql) return { count: 0, message: 'No SQL client available' }
	try {
		const result =
			await sql`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'`
		return { count: Number(result[0]?.count || 0), message: 'Success' }
	} catch (err) {
		console.error('Failed to get connection count:', err)
		return { count: -1, message: String(err) }
	}
}

export const APIRoute = createAPIFileRoute('/api/push')({
	POST: async ({ request }) => {
		try {
			console.log('🟨 Push endpoint received request')

			// 1) Read query params + body
			const url = new URL(request.url)
			const query = Object.fromEntries(url.searchParams.entries())
			const bodyText = await request.text()
			const body = JSON.parse(bodyText)

			console.log('🟦 Request details:', {
				url: url.toString(),
				query,
				body,
				headers: Object.fromEntries(request.headers.entries()),
			})

			// 2) Validate SQL client is available
			if (!sql || !processor) {
				throw new Error(
					'Database client not initialized. Check ZERO_UPSTREAM_DB env variable.',
				)
			}

			// Log connection count before processing
			const beforeCount = await getConnectionCount()
			console.log('🔵 Active DB connections before push:', beforeCount)

			// 3) Extract auth (JWT) from header or cookie
			const authHeader = request.headers.get('authorization') ?? ''
			const token = authHeader.replace(/^Bearer\s+/, '')
			const authData: AuthData = { sub: token ? parseSub(token) : null }

			console.log('🟩 Processing with auth:', {
				hasSub: !!authData.sub,
				token: token ? '(token present)' : '(no token)',
			})

			// 4) Call process()
			const result = await processor.process(
				createServerMutators(authData),
				query,
				body,
			)

			// Log connection count after processing
			const afterCount = await getConnectionCount()
			console.log('🔵 Active DB connections after push:', afterCount)

			console.log('🟪 Push completed successfully:', result)

			// 5) Return JSON
			return new Response(JSON.stringify(result), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			})
		} catch (error) {
			console.error('🟥 Push endpoint error:', error)
			return new Response(
				JSON.stringify({
					error: true,
					details: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined,
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'POST, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					},
				},
			)
		}
	},
	OPTIONS: async () => {
		// Handle CORS preflight requests
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		})
	},
})

/** Helper – decode the `sub` from your JWT token payload */
function parseSub(jwt: string): string | null {
	try {
		const [, payload] = jwt.split('.')
		const data = JSON.parse(atob(payload))
		return data.sub ?? null
	} catch {
		return null
	}
}

export { processor, sql }
