import NavMain from '@/components/nav-main'
import { SignUp } from '@/components/sign-up'
import { SupabaseSignupForm } from '@/components/supabase-signup'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/signup')({
	component: SignUpPage,
})

function SignUpPage() {
	return (
		<div className='flex flex-col flex-grow h-screen w-full items-center justify-center'>
			<NavMain location='auth' />
			<div className='w-full h-full flex flex-col items-center justify-center max-w-md'>
				{/* <SignUp /> */}
				<SupabaseSignupForm />
			</div>
		</div>
	)
}
