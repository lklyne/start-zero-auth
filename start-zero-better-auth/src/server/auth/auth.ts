import { deleteUserFromZero } from '@/lib/delete-user-from-zero'
import { authDb } from '@/server/db/auth-db'
import * as authSchema from '@/server/db/auth-schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { jwt } from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'
import * as dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = [
	'AUTH_DATABASE_URL',
	'BETTER_AUTH_SECRET',
	'BETTER_AUTH_URL',
] as const

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`)
	}
}

const secret = process.env.BETTER_AUTH_SECRET
const origin = process.env.BETTER_AUTH_URL

if (!secret || !origin) {
	throw new Error('Required environment variables are not set')
}

export const auth = betterAuth({
	secret,
	basePath: '/api/auth',
	database: drizzleAdapter(authDb, {
		schema: authSchema,
		provider: 'pg',
	}),

	plugins: [
		jwt({
			jwt: {
				expirationTime: '1w',
			},
		}),
		magicLink({
			sendMagicLink: async ({ email, token, url }, request) => {
				// Send login code email using the server-side email sender and template
				const { sendEmail } = await import('@/server/email/send')
				const { ZeroStartLoginCodeEmail } = await import(
					'@/emails/templates/login-code'
				)
				await sendEmail({
					to: email,
					subject: 'Your Zero Start login code',
					react: ZeroStartLoginCodeEmail({
						validationCode: token,
						magicLink: url,
					}),
				})
			},
		}),
		reactStartCookies(),
	],

	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
		},
	},

	emailAndPassword: {
		enabled: true,
		minPasswordLength: 2,
		autoSignIn: true,
	},

	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},

	// to do: add additional verification step during delete flow
	// https://www.better-auth.com/docs/concepts/users-accounts#adding-verification-before-deletion

	user: {
		deleteUser: {
			enabled: true,
			beforeDelete: async (user) => {
				// Delete user data from Zero before removing auth record
				await deleteUserFromZero(user.id)
			},
		},
	},
})
