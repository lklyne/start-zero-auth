import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useSyncUserZero } from '@/hooks/use-sync-user-zero'
import { initializeZero, zeroAtom } from '@/lib/zero-setup'
import { ZeroProvider } from '@rocicorp/zero/react'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { useEffect, useMemo } from 'react'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authed/app')({
	component: RouteComponent,
	ssr: false,
})

function AppContent() {
	const { syncUser } = useSyncUserZero()

	// Sync user data with Zero database when app loads
	useEffect(() => {
		syncUser()
	}, [syncUser])

	return (
		<SidebarProvider className='flex h-screen'>
			<AppSidebar variant='inset' />
			<div className='flex-1 p-2'>
				<main className='h-full border border-border bg-background rounded flex flex-col overflow-hidden'>
					<Outlet />
				</main>
			</div>
		</SidebarProvider>
	)
}

function RouteComponent() {
	const zero = useSyncExternalStore(zeroAtom.onChange, () => zeroAtom.value)
	const { user } = Route.useRouteContext()
	console.log('🔐 App route context:', { user })

	// Create stable dependency based on user ID only
	const userId = useMemo(() => user?.id, [user?.id])

	// Initialize Zero with user data - only when user ID changes
	useEffect(() => {
		if (!userId) return
		initializeZero(user)
	}, [userId, user])

	if (!zero) return null

	return (
		<Suspense fallback={null}>
			<ZeroProvider zero={zero}>
				<AppContent />
			</ZeroProvider>
		</Suspense>
	)
}
