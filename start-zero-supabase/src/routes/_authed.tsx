import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
	beforeLoad: async ({ location, context }) => {
		// If no user in context, redirect to login
		if (!context?.user) {
			throw redirect({ to: '/auth/login', search: { redirect: location.href } })
		}
		
		// Pass through the user context
		return { user: context.user }
	},
	component: AuthWrapper,
})

function AuthWrapper() {
	const { user } = Route.useRouteContext()
	console.log('🔐 _authed route context:', { user })

	return <Outlet />
}
