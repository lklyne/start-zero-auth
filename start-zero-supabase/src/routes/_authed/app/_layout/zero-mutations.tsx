import { MouseDownLink } from '@/components/mouse-down-link'
import AppNav from '@/components/nav-app'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import useRapidFire from '@/hooks/use-rapid-fire'
import { faker } from '@faker-js/faker'
import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute } from '@tanstack/react-router'
import { FileJson2, ListX, Plus, Table, X } from 'lucide-react'
import { useCallback, useState } from 'react'

export const Route = createFileRoute('/_authed/app/_layout/zero-mutations')({
	component: RouteComponent,
	ssr: false,
})

function PersonList({ view }: { view: 'json' | 'table' }) {
	const z = useZero()
	const [persons] = useQuery(z.query.persons)

	if (view === 'json') {
		return (
			<div className='rounded-lg bg-background min-w-[300px]'>
				<div className='p-4'>
					<pre className='text-xs text-left'>
						{JSON.stringify(persons, null, 2)}
					</pre>
				</div>
			</div>
		)
	}

	return (
		<div className='rounded-lg bg-background min-w-[300px]'>
			<div>
				{persons?.map((person) => (
					<div
						key={person.id}
						className='flex items-center justify-between hover:bg-secondary/40 group'
					>
						<MouseDownLink
							to='/app/$personId'
							params={{ personId: person.id }}
							className='flex grow items-center pl-4 py-2'
						>
							<span className='font-medium text-sm text-stone-700 group-hover:text-stone-950'>
								{person.name}
							</span>
							<div className='flex items-center gap-2 ml-auto mr-4'>
								<span className='text-sm text-muted-foreground w-auto'>
									{person.id}
								</span>
							</div>
						</MouseDownLink>
						<div className='pr-2 flex items-center'>
							<Button
								onClick={() => z.mutate.persons.delete({ id: person.id })}
								variant='ghost'
								size='xs'
								className='opacity-0 group-hover:opacity-100 transition-opacity'
							>
								<X className='w-4 h-4' />
							</Button>
						</div>
					</div>
				))}
			</div>
			{persons?.length === 0 && (
				<div className='flex items-center h-full px-4 py-3.5'>
					<p className='text-sm text-muted-foreground'>No one's here yet</p>
				</div>
			)}
		</div>
	)
}

function RouteComponent() {
	const z = useZero()
	const [persons] = useQuery(z.query.persons)
	const [view, setView] = useState<'table' | 'json'>('table')

	const numPersons = persons?.length ?? 0

	const addPerson = useCallback(() => {
		z.mutate.persons.insert({
			id: crypto.randomUUID(),
			name: faker.person.fullName(),
		})
	}, [z.mutate.persons])

	const clearAll = useCallback(() => {
		if (persons && persons.length > 0) {
			const ids = persons.map((p) => p.id)
			// @ts-expect-error - TODO: fix custom types
			z.mutate.persons.deleteMany({ ids })
		}
	}, [persons, z.mutate.persons])

	const rapidAddHandlers = useRapidFire(addPerson)

	return (
		<div className='flex flex-col h-full overflow-y-auto w-full'>
			<AppNav title='Zero Mutations'>
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
								<h2 className='font-medium text-sm'>Persons ({numPersons})</h2>
							</div>
							<div className='flex gap-2'>
								<TooltipProvider>
									<Tooltip delayDuration={500}>
										<TooltipTrigger asChild>
											<Button variant='ghost' size='xs' {...rapidAddHandlers}>
												<Plus className='w-4 h-4' />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Hold to rapidly add people</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip delayDuration={500}>
										<TooltipTrigger asChild>
											<Button size='xs' variant='ghost' onClick={clearAll}>
												<ListX className='w-4 h-4' />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Clear all people</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>

						<PersonList view={view} />
					</div>
				</div>
			</div>
		</div>
	)
}
