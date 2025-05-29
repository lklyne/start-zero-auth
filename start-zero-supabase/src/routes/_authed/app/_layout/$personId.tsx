import AppNav from '@/components/nav-app'
import { Button } from '@/components/ui/button'
import useRapidFire from '@/hooks/use-rapid-fire'
import { useQuery, useZero } from '@rocicorp/zero/react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'

export const Route = createFileRoute('/_authed/app/_layout/$personId')({
	component: PersonComponent,
	ssr: false,
})

function PersonComponent() {
	const { personId } = Route.useParams()
	const z = useZero()
	const router = useRouter()
	// Use ZQL's orderBy to sort by name
	const [persons] = useQuery(z.query.persons.orderBy('name', 'asc'))

	const currentIndex = persons?.findIndex((p) => p.id === personId) ?? -1
	const person = persons?.[currentIndex]

	const goToNext = useCallback(() => {
		if (!persons?.length) return
		const nextIndex = (currentIndex + 1) % persons.length
		const nextPerson = persons[nextIndex]
		router.navigate({
			to: '/app/$personId',
			params: { personId: nextPerson.id },
			replace: true, // Use replace to avoid building up history
		})
	}, [currentIndex, persons, router])

	const goToPrev = useCallback(() => {
		if (!persons?.length) return
		const prevIndex = (currentIndex - 1 + persons.length) % persons.length
		const prevPerson = persons[prevIndex]
		router.navigate({
			to: '/app/$personId',
			params: { personId: prevPerson.id },
			replace: true, // Use replace to avoid building up history
		})
	}, [currentIndex, persons, router])

	const nextButtonHandlers = useRapidFire(goToNext, 100)
	const prevButtonHandlers = useRapidFire(goToPrev, 100)

	if (!person) {
		return <div className='p-4'>Person not found</div>
	}

	return (
		<div className='container flex flex-col h-full overflow-y-auto'>
			<AppNav
				breadcrumbs={{
					items: [
						{
							label: 'Zero Mutators',
							href: '/app',
						},
						{
							label: person.name,
						},
					],
				}}
			>
				<div className='flex gap-2'>
					<Button
						variant='ghost'
						size='icon'
						disabled={!persons?.length}
						{...prevButtonHandlers}
					>
						<ChevronLeft className='h-4 w-4' />
						<span className='sr-only'>Previous person</span>
					</Button>
					<Button
						variant='ghost'
						size='icon'
						disabled={!persons?.length}
						{...nextButtonHandlers}
					>
						<ChevronRight className='h-4 w-4' />
						<span className='sr-only'>Next person</span>
					</Button>
				</div>
			</AppNav>
			<div className='p-4'>
				<h1 className='text-2xl font-bold mb-4'>{person.name}</h1>
				<div className='text-sm text-muted-foreground'>ID: {person.id}</div>
			</div>
		</div>
	)
}
