import { auth } from '@/server/auth/auth' // Import auth here ONLY
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'

// Define the server function to fetch the session
export const fetchAuthSession = createServerFn({ method: 'GET' }).handler(
	async () => {
		const request = getWebRequest()
		if (!request) {
			console.error(
				'Server request context not found when fetching auth session.',
			)
			return { session: null }
		}

		try {
			// Fetch session using headers from the request
			const session = await auth.api.getSession({
				headers: request.headers,
			})
			return { session }
		} catch (error) {
			// Log error and return null session
			console.error('Failed to fetch auth session:', error)
			return { session: null }
		}
	},
)
