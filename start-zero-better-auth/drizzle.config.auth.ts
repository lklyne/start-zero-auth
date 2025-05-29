import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error('AUTH_DATABASE_URL environment variable is required.')
}

export default defineConfig({
  schema: './src/db/auth-schema.ts',
  out: './drizzle/auth',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL,
  },
  verbose: true,
  strict: true,
}) 