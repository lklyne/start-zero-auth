import { signOut } from '@/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'
import { Button } from './ui/button'

export function AccountLogout() {
	const navigate = useNavigate()

	const handleLogout = async () => {
		navigate({ to: '/' })
		await signOut()
	}

	return (
		<Button variant='outline' onClick={handleLogout} size='xs' className='px-2'>
			<LogOutIcon className='h-4 w-4' />
			Log Out
		</Button>
	)
}
