import { DefaultCatchBoundary } from '@/components/default-catch-boundry'
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
		errorComponent: (props: ErrorComponentProps) => {
			return (
				<RootDocument>
					<DefaultCatchBoundary {...props} />
				</RootDocument>
			)
		},
	}),

	component: () => (
		<>
			<RootDocument>
				<Outlet />
				<TanStackRouterDevtools position='bottom-right' />
			</RootDocument>
		</>
	),
})

function RootDocument({ children }: { children: React.ReactNode }) {
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
