import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/_layout/account-debug')({
	component: RouteComponent,
})

function RouteComponent() {
	return <div>Hello "/_authed/app/_layout/account-debug"!</div>
}
