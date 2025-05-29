import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { zeroAtom } from '@/lib/zero-setup'
import { authAtom } from '@/lib/zero-setup'
import { ZeroProvider } from '@rocicorp/zero/react'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { useEffect } from 'react'
import { Suspense } from 'react'

export const Route = createFileRoute('/_authed/app')({
	component: RouteComponent,
	ssr: false,
})

function AppContent() {
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
	const auth = useSyncExternalStore(authAtom.onChange, () => authAtom.value)

	// upsert user into Zero
	useEffect(() => {
		if (!zero || !auth) return
		console.log('🔄 Upserting user into Zero')
		zero.mutate.users.upsert({
			id: auth.decoded.sub as string,
			email: auth.decoded.email ?? '',
			name: auth.decoded.name ?? '',
		})
	}, [zero, auth])

	if (!zero) return null

	return (
		<Suspense fallback={null}>
			<ZeroProvider zero={zero}>
				<AppContent />
			</ZeroProvider>
		</Suspense>
	)
}
