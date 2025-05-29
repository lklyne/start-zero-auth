import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import type { ZeroSchema } from '@/server/db/zero-permissions'
import { useQuery, useZero } from '@rocicorp/zero/react'
import type { Session } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AccountDelete } from './account-delete'
import { Button } from './ui/button'

const AccountOverview = () => {
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)
	const supabase = getSupabaseBrowserClient()

	// Placeholder state for subscription loading, adapt as needed
	const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)
	const z = useZero<ZeroSchema>()

	// Fetch Supabase session
	useEffect(() => {
		const fetchSession = async () => {
			const { data, error } = await supabase.auth.getSession()
			if (error) {
				console.error('Error fetching session:', error)
			} else {
				setSession(data.session)
			}
			setLoading(false)
		}

		fetchSession()

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [supabase])

	const userId = session?.user?.id || ''

	const [zeroUser] = useQuery(z.query.users.where('id', userId).one())

	// Placeholder functions, adapt as needed
	const refetchSubscription = () => {
		console.log('Refetching subscription...')
		// Add actual logic later
		setIsSubscriptionLoading(true)
		setTimeout(() => setIsSubscriptionLoading(false), 1000) // Simulate loading
	}

	return (
		<div className='m-4'>
			{loading && <p>Loading account data...</p>}

			{session ? (
				<div className='space-y-4'>
					<div className='flex flex-col border bg-background'>
						<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
							<h2 className='font-medium text-sm'>Profile Information</h2>
						</div>
						<div className='p-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-muted-foreground'>Name</p>
									<p className='text-sm'>
										{session.user.user_metadata?.name ||
											zeroUser?.name ||
											'Not available'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Email</p>
									<p className='text-sm'>
										{session.user.email || zeroUser?.email || 'Not available'}
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className='flex flex-col border bg-background'>
						<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
							<h2 className='font-medium text-sm'>Billing</h2>
						</div>
						<div className='p-4'>
							<div className='space-y-6'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-muted-foreground'>
											Current Plan
										</p>
										<p className='text-sm'>{'Free (Placeholder)'}</p>
									</div>
								</div>

								<div className='flex flex-wrap gap-2'>
									<Button variant='outline' size='sm'>
										{'Upgrade to Pro (Placeholder)'}
									</Button>
									<Button variant='outline' size='sm'>
										Test Pro Feature (Placeholder)
									</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={refetchSubscription}
										disabled={isSubscriptionLoading}
									>
										{isSubscriptionLoading ? (
											<Loader2 className='h-4 w-4 animate-spin' />
										) : (
											'Refresh'
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div className='flex flex-col border bg-background'>
						<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
							<h2 className='font-medium text-sm'>Danger Zone</h2>
						</div>
						<div className='p-4'>
							<div className='space-y-4'>
								<p className='text-sm text-muted-foreground'>
									Deleting your account will permanently remove all your data
									from Zero and Supabase. This action cannot be undone.
								</p>
								<div>
									<AccountDelete />
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				!loading && <p>Please log in to view account details.</p>
			)}
		</div>
	)
}

export default AccountOverview
