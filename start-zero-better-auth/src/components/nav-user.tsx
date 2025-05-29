import {
	BugIcon,
	CreditCardIcon,
	LogOutIcon,
	MoreVerticalIcon,
	UserCircleIcon,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export function NavUser() {
	const { data: session, isPending } = authClient.useSession()
	const navigate = useNavigate()

	// If session is loading or no user, return null
	if (isPending || !session?.user) return null

	const user = session.user

	const handleSignout = async () => {
		await authClient.signOut()
		navigate({ to: '/' })
	}

	const handleAccount = async () => {
		navigate({ to: '/app/account' })
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					className='rounded-md px-2 py-2 w-full h-auto'
				>
					<Avatar className='h-8 w-8 rounded-sm text-sm mr-2'>
						<AvatarImage src={user.image || ''} alt={user.name || ''} />
						<AvatarFallback className='rounded-md'>
							{user.name?.slice(0, 2)?.toUpperCase() || 'UN'}
						</AvatarFallback>
					</Avatar>

					<div className='grid flex-1 text-left text-sm leading-tight'>
						<span className='truncate font-medium'>
							{user.name || 'Unknown'}
						</span>
						<span className='truncate text-xs text-muted-foreground'>
							{user.email}
						</span>
					</div>
					<MoreVerticalIcon className='ml-auto size-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
				align='end'
				sideOffset={4}
			>
				<DropdownMenuLabel className='p-0 font-normal'>
					<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
						<Avatar className='h-8 w-8 rounded-lg'>
							<AvatarImage src={user.image || ''} alt={user.name || ''} />
							<AvatarFallback className='rounded-lg'>
								{user.name?.slice(0, 2)?.toUpperCase() || 'UN'}
							</AvatarFallback>
						</Avatar>
						<div className='grid flex-1 text-left text-sm leading-tight'>
							<span className='truncate font-medium'>
								{user.name || 'Unknown'}
							</span>
							<span className='truncate text-xs text-muted-foreground'>
								{user.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={handleAccount}>
						<UserCircleIcon className='mr-2 h-4 w-4' />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCardIcon className='mr-2 h-4 w-4' />
						Billing
					</DropdownMenuItem>

					<Link to='/app/account-debug'>
						<DropdownMenuItem>
							<BugIcon className='mr-2 h-4 w-4' />
							Debug
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignout}>
					<LogOutIcon className='mr-2 h-4 w-4' />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
