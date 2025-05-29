import { DefaultCatchBoundary } from '@/components/default-catch-boundry'
import { NotFound } from '@/components/not-found'
import { getSupabaseServerClient } from '@/lib/supabase'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

// Import CSS as a URL
import appCss from '@/styles.css?url'
import { createServerFn } from '@tanstack/react-start'

const fetchUser = createServerFn({ 
	method: 'GET',
}).handler(async () => {
	const supabase = await getSupabaseServerClient()
	const {
		data: { session },
		error: _error,
	} = await supabase.auth.getSession()

	if (!session?.user?.email) {
		return null
	}

	return {
		email: session.user.email,
		id: session.user.id,
		name: session.user.user_metadata?.name || session.user.email.split('@')[0],
		accessToken: session.access_token,
	}
})

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
			<TanStackRouterDevtools position='bottom-right' />
		</RootDocument>
	)
}

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'Zero Start',
			},
		],

		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),

	beforeLoad: async () => {
		const user = await fetchUser()

		return {
			user,
		}
	},

	errorComponent: (props: ErrorComponentProps) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		)
	},

	notFoundComponent: () => <NotFound />,

	component: RootComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	const { user } = Route.useRouteContext()

	console.log('Server-side route context:', { user })

	return (
		<html lang='en'>
			<head>
				<HeadContent />
			</head>
			<body className='overscroll-none'>
				{children}
				<Scripts />
			</body>
		</html>
	)
}
