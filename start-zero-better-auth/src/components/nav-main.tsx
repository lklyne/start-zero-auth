import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { Link } from '@tanstack/react-router'

interface HeaderProps {
	location?: 'homepage' | 'auth' | 'app'
}

export default function NavMain({ location = 'homepage' }: HeaderProps) {
	return location === 'homepage' ? (
		<HomePageHeader />
	) : location === 'auth' ? (
		<AuthPageHeader />
	) : null
}

const HomePageHeader = () => {
	const { data: session, isPending } = useSession()

	const isLoggedIn = !!session && !isPending

	return (
		<nav className='w-full py-4 px-4 bg-background flex justify-between items-center border-b border-border text-base h-18'>
			<Link
				className='font-semibold text-sm flex items-center gap-2 p-1.5'
				to='/'
			>
				<Logo />
				Zero Start
			</Link>
			<div className='flex gap-6 items-center text-sm'>
				<a
					href='https://github.com/lklyne/zero-start'
					target='_blank'
					rel='noopener noreferrer'
					className=''
				>
					Github
				</a>

				{isLoggedIn ? (
					<Link to='/app'>
						<Button size='sm' variant='outline'>
							Dashboard
						</Button>
					</Link>
				) : (
					<Link to='/auth/login'>
						<Button size='sm' variant='outline'>
							Login
						</Button>
					</Link>
				)}
			</div>
		</nav>
	)
}

const AuthPageHeader = () => {
	return (
		<nav className='w-full py-4 px-4 bg-background flex justify-between items-center border-b border-border h-18'>
			<Link
				className='font-semibold text-sm flex items-center gap-2 p-1.5'
				to='/'
			>
				<Logo />
				Zero Start
			</Link>
		</nav>
	)
}
