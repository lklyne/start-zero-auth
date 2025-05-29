import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './auth-schema'

dotenv.config()

if (!process.env.AUTH_DATABASE_URL) {
	throw new Error('AUTH_DATABASE_URL environment variable is required.')
}

const connectionString = process.env.AUTH_DATABASE_URL
const client = postgres(connectionString, { max: 1 })

// Export the Drizzle instance connected to the auth DB and using the auth schema
export const authDb = drizzle(client, { schema })
