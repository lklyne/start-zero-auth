import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/_layout/')({
	loader: () => {
		// Redirect to zero-mutations whenever the index route is accessed
		throw redirect({ to: '/app/zero-mutations' })
	},
})
