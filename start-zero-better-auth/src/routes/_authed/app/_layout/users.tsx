import AppNav from '@/components/nav-app'
import { Button } from '@/components/ui/button'
import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute } from '@tanstack/react-router'
import { FileJson2, Table } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authed/app/_layout/users')({
	component: RouteComponent,
	ssr: false,
})

function UserList({ view }: { view: 'json' | 'table' }) {
	const z = useZero()
	const [users] = useQuery(z.query.users)

	if (view === 'json') {
		return (
			<div className='rounded-lg bg-background min-w-[300px]'>
				<div className='p-4'>
					<pre className='text-xs text-left'>
						{JSON.stringify(users, null, 2)}
					</pre>
				</div>
			</div>
		)
	}

	return (
		<div className='rounded-lg bg-background min-w-[300px]'>
			<div>
				{users?.map((user) => (
					<div key={user.id} className='flex'>
						<div className='flex grow items-center justify-between hover:bg-secondary/40 group pl-4 pr-4 py-3'>
							<span className='font-medium text-sm text-stone-700 group-hover:text-stone-950'>
								{user.name}
							</span>
							<div className='flex items-center'>
								<span className='text-sm text-muted-foreground'>
									{user.email}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
			{users?.length === 0 && (
				<div className='flex items-center h-full px-4 py-3.5'>
					<p className='text-sm text-muted-foreground'>No users yet</p>
				</div>
			)}
		</div>
	)
}

function RouteComponent() {
	const z = useZero()
	const [users] = useQuery(z.query.users)
	const [view, setView] = useState<'table' | 'json'>('table')

	const numUsers = users?.length ?? 0

	return (
		<div className='flex flex-col h-full overflow-y-auto w-full'>
			<AppNav title='Zero Users'>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='xs'
						onClick={() => setView('table')}
						className={
							view === 'table'
								? 'bg-stone-200/80 hover:bg-stone-200 border-stone-300'
								: ''
						}
					>
						<Table className='w-4 h-4' />
						Table
					</Button>
					<Button
						variant='outline'
						size='xs'
						onClick={() => setView('json')}
						className={
							view === 'json'
								? 'bg-stone-200/80 hover:bg-stone-200 border-stone-300'
								: ''
						}
					>
						<FileJson2 className='w-3.5 h-3.5' />
						JSON
					</Button>
				</div>
			</AppNav>
			<div className='flex flex-col grow overflow-y-auto'>
				<div className=''>
					<div className='flex flex-col'>
						<div className='sticky top-0 flex items-center gap-2 w-full justify-between px-4 py-2 bg-background border-b border-border'>
							<div className='flex items-center gap-4'>
								<h2 className='font-medium text-sm'>Users ({numUsers})</h2>
							</div>
						</div>

						<UserList view={view} />
					</div>
				</div>
			</div>
		</div>
	)
}
