import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Button } from './ui/button'

// Server function for deleting a user
export const deleteUserFn = createServerFn({ method: 'POST' }).handler(
	async () => {
		// Import server-side modules at runtime
		const { getSupabaseServerClient } = await import('@/lib/supabase')
		const supabase = getSupabaseServerClient()

		try {
			// Get the authenticated user
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) {
				return {
					error: true,
					message: 'No authenticated user found',
				}
			}

			// Delete user data from Zero
			const postgres = await import('postgres')
			const dbUrl = process.env.ZERO_UPSTREAM_DB ?? ''
			const sql = postgres.default(dbUrl, {
				max: 1,
				ssl: false,
				idle_timeout: 20,
			})

			try {
				await sql.begin(async (tx) => {
					// Delete the user from the users table
					await tx`DELETE FROM public.users WHERE id = ${user.id}`
				})
			} finally {
				// Ensure the connection is closed
				await sql.end({ timeout: 5 })
			}

			// Delete user from Supabase Auth
			// Note: This requires Supabase Service Role Key in production
			await supabase.auth.admin.deleteUser(user.id)

			return { error: false }
		} catch (error) {
			console.error('Error deleting user:', error)
			return {
				error: true,
				message:
					error instanceof Error ? error.message : 'Failed to delete user',
			}
		}
	},
)

export function AccountDelete() {
	const [isDeleting, setIsDeleting] = useState(false)
	const navigate = useNavigate()
	const supabase = getSupabaseBrowserClient()

	const deleteUser = async () => {
		if (
			!window.confirm(
				'Are you sure you want to delete your account? This cannot be undone.',
			)
		) {
			return
		}

		try {
			setIsDeleting(true)
			console.log('Deleting user account...')

			// Call the server function to delete the user
			const result = await deleteUserFn()

			if (result.error) {
				throw new Error(result.message || 'Failed to delete account')
			}

			// Sign out client-side after successful deletion
			await supabase.auth.signOut()

			// Navigate to home page after successful deletion
			navigate({ to: '/' })
		} catch (error) {
			console.error('Failed to delete account:', error)
			alert(
				`Failed to delete your account: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<Button
			variant='destructive'
			onClick={deleteUser}
			size='sm'
			disabled={isDeleting}
		>
			{isDeleting ? 'Deleting...' : 'Delete Account'}
		</Button>
	)
}
