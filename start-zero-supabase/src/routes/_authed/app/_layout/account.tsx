import { AccountDebug } from '@/components/account-debug'
import { AccountLogout } from '@/components/account-logout'
import AccountOverview from '@/components/account-overview'
import NavApp from '@/components/nav-app'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/_layout/account')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className='container flex flex-col min-h-screen'>
			<NavApp title='Account'>
				<div className='flex items-center gap-2'>
					<AccountDebug />
					<AccountLogout />
				</div>
			</NavApp>
			<div className='flex flex-col grow overflow-y-auto'>
				<AccountOverview />
			</div>
		</div>
	)
}
