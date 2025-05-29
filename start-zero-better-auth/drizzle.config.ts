import type { Config } from 'drizzle-kit'

export default {
	schema: 'src/server/db/schema.ts',
	out: 'src/server/db/drizzle',
	dialect: 'postgresql',
	strict: true,
	verbose: true,
	dbCredentials: {
		url: process.env.ZERO_UPSTREAM_DB!,
	},
} satisfies Config
