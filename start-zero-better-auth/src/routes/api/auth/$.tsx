import { auth } from '@/server/auth/auth'
import { createAPIFileRoute } from '@tanstack/react-start/api'

// This route handles all requests under /api/auth/*
export const APIRoute = createAPIFileRoute('/api/auth/$')({
	GET: async ({ request }) => {
		try {
			// console.log('🔐 Auth GET request:', request.url)
			const response = await auth.handler(request)
			// console.log('🔓 Auth response:', {
			// 	status: response.status,
			// 	headers: Object.fromEntries(response.headers.entries()),
			// })
			return response
		} catch (error) {
			// console.error('🔥 Auth error:', error)
			return new Response(JSON.stringify({ error: 'Auth handler failed' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			})
		}
	},
	POST: async ({ request }) => {
		try {
			// console.log('🔐 Auth POST request:', request.url)
			const response = await auth.handler(request)
			// console.log('🔓 Auth response:', {
			// 	status: response.status,
			// 	headers: Object.fromEntries(response.headers.entries()),
			// })
			return response
		} catch (error) {
			// console.error('🔥 Auth error:', error)
			return new Response(JSON.stringify({ error: 'Auth handler failed' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			})
		}
	},
	// Handle other methods that Better Auth might need
	PUT: ({ request }) => auth.handler(request),
	DELETE: ({ request }) => auth.handler(request),
	PATCH: ({ request }) => auth.handler(request),
})
