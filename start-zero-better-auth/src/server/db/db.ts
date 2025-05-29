/// <reference types="@types/pg" />

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// Singleton pattern for database connections
// This ensures we reuse the same pool across the application
let poolInstance: Pool | null = null

/**
 * Get or create a singleton database pool
 */
export function getDatabasePool(database_url: string): Pool {
	if (!poolInstance) {
		poolInstance = new Pool({
			connectionString: database_url,
			max: 10, // Allow up to 10 connections in the pool
			idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
		})

		// Add event listeners for connection lifecycle
		poolInstance.on('connect', () => {
			console.log('🔌 New database connection established')
		})

		poolInstance.on('error', (err: Error) => {
			console.error('❌ Unexpected database pool error:', err)
		})
	}

	return poolInstance
}

/**
 * Create a Drizzle database instance using the singleton pool
 */
export async function createDb(
	database_url: string,
	schema: Record<string, unknown>,
) {
	const pool = getDatabasePool(database_url)

	return drizzle(pool, {
		schema: schema,
	})
}

/**
 * Get current connection pool statistics (for monitoring)
 */
export async function getPoolStats() {
	if (!poolInstance) {
		return { total: 0, idle: 0, waiting: 0, status: 'Not initialized' }
	}

	return {
		total: poolInstance.totalCount,
		idle: poolInstance.idleCount,
		waiting: poolInstance.waitingCount,
		status: 'Active',
	}
}
