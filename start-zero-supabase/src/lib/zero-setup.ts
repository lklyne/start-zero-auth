import { Atom } from '@/lib/atom'
import { type ClientMutators, createClientMutators } from '@/lib/zero-client-mutators'
import type { AuthData, ZeroSchema } from '@/server/db/zero-permissions'
import { schema } from '@/server/db/zero-schema.gen'
import { Zero } from '@rocicorp/zero'
import { CACHE_FOREVER } from './query-cache-policy'

export type User = {
	id: string
	email: string
	name: string
	accessToken: string
}

const zeroAtom = new Atom<Zero<ZeroSchema, ClientMutators>>()

let didPreload = false

export function preload(z: Zero<ZeroSchema, ClientMutators>) {
	if (didPreload) {
		return
	}
	didPreload = true

	// Preload all users and persons with CACHE_FOREVER policy
	z.query.users.preload(CACHE_FOREVER)
	z.query.persons.preload(CACHE_FOREVER)
}

let currentUserId: string | null = null

export function initializeZero(user: User) {
	// Only reinitialize if user has actually changed
	if (currentUserId === user.id && zeroAtom.value) {
		console.log('🟪 Zero instance already exists for user', user.id)
		return zeroAtom.value
	}

	// Close existing instance if any
	zeroAtom.value?.close()

	// Ensure server URL is provided
	const serverURL = import.meta.env.VITE_PUBLIC_SERVER
	if (!serverURL) {
		throw new Error(
			'VITE_PUBLIC_SERVER environment variable is not set. Zero cannot connect.',
		)
	}

	const authData: AuthData = {
		sub: user.id,
		email: user.email,
		name: user.name,
	}

	const zero = new Zero<ZeroSchema, ClientMutators>({
		schema,
		server: serverURL,
		logLevel: 'error',
		userID: user.id,
		mutators: createClientMutators(authData),
		auth: () => user.accessToken,
	})

	zeroAtom.value = zero
	currentUserId = user.id

	// Call preload after zero instance is created
	preload(zero)
	console.log('🟪 Creating new Zero instance for user', user.id)
	
	return zero
}

export { zeroAtom }
