import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { useNavigate } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'
import { Button } from './ui/button'

export function AccountLogout() {
	const navigate = useNavigate()

	const handleLogout = async () => {
		const supabase = getSupabaseBrowserClient()
		await supabase.auth.signOut()
		navigate({ to: '/' })
	}

	return (
		<Button variant='outline' onClick={handleLogout} size='xs' className='px-2'>
			<LogOutIcon className='h-4 w-4' />
			Log Out
		</Button>
	)
}
