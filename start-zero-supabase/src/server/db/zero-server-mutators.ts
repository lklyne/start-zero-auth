import type { AuthData } from '@/server/db/zero-permissions'
import type { Schema } from '@/server/db/zero-schema.gen'
import { createSharedMutators } from '@/server/db/zero-shared-mutators'
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero'

/**
 * Server mutators that extend shared mutators with server-specific logic
 * Following the zbugs pattern of delegation + additional server operations
 */
export function createServerMutators(authData: AuthData): CustomMutatorDefs<Schema> {
	const sharedMutators = createSharedMutators(authData)

	return {
		persons: {
			async insert(tx: Transaction<Schema>, args: { id: string; name: string }) {
				// Delegate to shared mutator for core logic
				await sharedMutators.persons.insert(tx, args)
				
				// Add server-specific logic here if needed
				// e.g. logging, notifications, analytics, etc.
				console.log(`[Server] Person created: ${args.name} (${args.id})`)
			},
			async delete(tx: Transaction<Schema>, args: { id: string }) {
				// Delegate to shared mutator
				await sharedMutators.persons.delete(tx, args)
				
				// Add server-specific logic
				console.log(`[Server] Person deleted: ${args.id}`)
			},
			async deleteMany(tx: Transaction<Schema>, args: { ids: string[] }) {
				// Delegate to shared mutator
				await sharedMutators.persons.deleteMany(tx, args)
				
				// Add server-specific logic
				console.log(`[Server] Persons deleted: ${args.ids.length} items`)
			},
		},
		users: {
			async create(tx: Transaction<Schema>, u: { id: string; email: string; name: string }) {
				// Delegate to shared mutator
				await sharedMutators.users.create(tx, u)
				
				// Add server-specific logic
				console.log(`[Server] User created: ${u.email} (${u.id})`)
			},
			async delete(tx: Transaction<Schema>, args: { id: string }) {
				// Delegate to shared mutator
				await sharedMutators.users.delete(tx, args)
				
				// Add server-specific logic
				console.log(`[Server] User deleted: ${args.id}`)
			},
			async upsert(tx: Transaction<Schema>, args: { id: string; email: string; name: string }) {
				// Delegate to shared mutator
				await sharedMutators.users.upsert(tx, args)
				
				// Add server-specific logic
				console.log(`[Server] User upserted: ${args.email} (${args.id})`)
			},
		},
	}
}