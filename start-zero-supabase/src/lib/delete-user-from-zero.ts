import postgres from 'postgres'

/**
 * Delete a user from Zero when they delete their Better Auth account
 * This ensures all user data is cleaned up properly in Zero Sync
 */
export async function deleteUserFromZero(userId: string): Promise<void> {
	console.log('🗑️ Deleting user from Zero DB:', userId)

	const dbUrl = process.env.ZERO_UPSTREAM_DB ?? ''
	const sql = postgres(dbUrl, {
		max: 1,
		ssl: false,
		idle_timeout: 20,
	})

	try {
		// Use sql.begin for automatic transaction handling
		await sql.begin(async (tx) => {
			// Delete the user from the users table
			await tx`DELETE FROM public.users WHERE id = ${userId}`
		})

		console.log('✅ User deleted from Zero:', userId)
	} catch (error) {
		console.error('❌ Failed to delete user from Zero:', userId, error)
		// We don't throw here to avoid preventing the auth deletion
		// In a production app, you might want to handle this differently
	} finally {
		// Ensure the connection is closed
		await sql.end({ timeout: 5 })
	}
}
