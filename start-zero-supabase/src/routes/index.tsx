import NavMain from '@/components/nav-main'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: LandingPage,
})

function LandingPage() {
	const stacks = [
		{
			name: 'Zero',
			url: 'https://zero.rocicorp.dev/',
			description: 'Sync engine for instant UI updates.',
		},
		{
			name: 'Tanstack Start',
			url: 'https://tanstack.com/start/latest',
			description: 'Full-stack React framework.',
		},
		{
			name: 'Supabase',
			url: 'https://supabase.com',
			description: 'Postgres database and auth.',
		},
		{
			name: 'Resend',
			url: 'https://resend.com/',
			description: 'Email service.',
		},
		{
			name: 'Shadcn UI',
			url: 'https://ui.shadcn.com/',
			description: 'UI library.',
		},
		{
			name: 'Polar',
			url: 'https://polar.sh/',
			description: 'Payments and subscriptions. (Planned)',
		},
	]

	return (
		<div className='text-center bg-background h-screen flex flex-col'>
			<NavMain location='homepage' />

			<main className='flex flex-col items-center justify-center h-full'>
				<div className='size-full bg-background text-foreground relative overflow-hidden flex flex-col'>
					<div className='relative z-10 flex flex-col items-center flex-1 px-4'>
						<div className='flex flex-col items-center justify-center flex-1 gap-2'>
							<h1
								className='text-xl md:text-6xl font-semibold
					 text-center leading-normal tracking-tight'
							>
								Zero Start
							</h1>
							<p className='text-center text-muted-foreground mb-4 text-xl'>
								A starter template for fast web apps.
							</p>
							<div className='flex mt-12 flex-wrap items-center justify-center'>
								{stacks.map((stack) => (
									<StackItem
										key={stack.name}
										name={stack.name}
										url={stack.url}
										description={stack.description}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

function StackItem({
	name,
	url,
	description,
}: {
	name: string
	url: string
	description: string
}) {
	return (
		<a
			href={url}
			target='_blank'
			rel='noopener noreferrer'
			className='flex flex-col transition-transform lg:px-12 lg:py-8 px-6 py-4 border border-border items-start -m-[0.5px] hover:relative hover:z-10 hover:border-primary/80 text-pretty hover:bg-secondary/20 group min-w-80'
		>
			<div className='flex items-center justify-center w-full'>
				<h3 className='transition-transform duration-200 font-medium group-hover:translate-x-[-4px] will-change-transform'>
					{name}
				</h3>
				<span className='opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1 will-change-transform'>
					→
				</span>
			</div>
			<p className='text-muted-foreground text-sm w-full text-center text-balance'>
				{description}
			</p>
		</a>
	)
}

export default LandingPage
