import { Atom } from '@/lib/atom'
import { type Mutators, createMutators } from '@/mutators/client'
import { clearJwt } from '@/server/auth/jwt'
import type { AuthData, ZeroSchema } from '@/server/db/zero-permissions'
import { schema } from '@/server/db/zero-schema.gen'
import { Zero } from '@rocicorp/zero'
import { CACHE_FOREVER } from './query-cache-policy'

export type LoginState = {
	encoded: string
	decoded: AuthData
}

const zeroAtom = new Atom<Zero<ZeroSchema, Mutators>>()
const authAtom = new Atom<LoginState>()

let didPreload = false

// Track the last-processed encoded token to avoid unnecessary Zero restarts
let _prevEncoded: string | undefined

export function preload(z: Zero<ZeroSchema, Mutators>) {
	if (didPreload) {
		return
	}
	// console.log('🟦 preload runs')
	didPreload = true

	// Preload all users and persons with CACHE_FOREVER policy
	z.query.users.preload(CACHE_FOREVER)
	z.query.persons.preload(CACHE_FOREVER)
}

// Re-create Zero whenever auth changes
authAtom.onChange((auth) => {
	// Skip until we actually have real auth data
	// console.log('🟦 authAtom.onChange runs')
	if (!auth) {
		return
	}
	// Only recreate Zero if the encoded JWT actually changed
	const newEncoded = auth?.encoded
	if (newEncoded === _prevEncoded) {
		return
	}
	_prevEncoded = newEncoded

	// Close existing instance if any
	zeroAtom.value?.close()
	console.log('🟪 Creating new Zero instance')

	// Ensure server URL is provided
	const server = import.meta.env.VITE_PUBLIC_SERVER
	if (!server) {
		throw new Error(
			'VITE_PUBLIC_SERVER environment variable is not set. Zero cannot connect.',
		)
	}

	// console.log(auth?.decoded)

	const authData = auth?.decoded
	const zero = new Zero<ZeroSchema, Mutators>({
		schema,
		server,
		logLevel: 'error',
		userID: authData?.sub ?? 'anon',
		mutators: createMutators(authData ?? { sub: null }),
		auth: (error?: 'invalid-token') => {
			if (error === 'invalid-token') {
				clearJwt()
				authAtom.value = undefined
				return undefined
			}
			return auth?.encoded
		},
	})

	zeroAtom.value = zero

	// Call preload after zero instance is created
	preload(zero)

	// Expose zero instance in dev tools
	// if (import.meta.env.DEV) {
	// 	const devWindow = window as { zero?: typeof zero }
	// 	devWindow.zero = zero
	// }
})

export { zeroAtom, authAtom }
