import type { AuthData } from '@/server/db/zero-permissions'
import type { Schema } from '@/server/db/zero-schema.gen'
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero'

/**
 * Shared mutators containing core business logic and database operations
 * These are used by both client and server mutators
 */
export function createSharedMutators(authData: AuthData) {
	return {
		persons: {
			async insert(
				tx: Transaction<Schema>,
				args: { id: string; name: string },
			) {
				// e.g. permission check: only logged-in users can insert
				if (!authData.sub) throw new Error('Not authenticated')
				await tx.mutate.persons.insert(args)
			},
			async delete(tx: Transaction<Schema>, args: { id: string }) {
				if (!authData.sub) throw new Error('Not authenticated')
				await tx.mutate.persons.delete(args)
			},
			async deleteMany(tx: Transaction<Schema>, args: { ids: string[] }) {
				if (!authData.sub) throw new Error('Not authenticated')
				for (const id of args.ids) {
					await tx.mutate.persons.delete({ id })
				}
			},
		},
		users: {
			async create(
				tx: Transaction<Schema>,
				u: { id: string; email: string; name: string },
			) {
				if (!authData.sub) throw new Error('Not authenticated')

				// Check if user already exists
				if (await tx.query.users.where('id', u.id).one().run()) return
				await tx.mutate.users.insert(u)
			},
			async delete(tx: Transaction<Schema>, args: { id: string }) {
				if (!authData.sub) throw new Error('Not authenticated')

				// Ensure users can only delete their own account
				if (args.id !== authData.sub)
					throw new Error("Cannot delete another user's account")
				await tx.mutate.users.delete(args)
			},
			async upsert(
				tx: Transaction<Schema>,
				args: { id: string; email: string; name: string },
			) {
				if (!authData.sub) throw new Error('Not authenticated')
				await tx.mutate.users.upsert(args)
			},
		},
	} as const satisfies CustomMutatorDefs<Schema>
}

export type SharedMutators = ReturnType<typeof createSharedMutators>