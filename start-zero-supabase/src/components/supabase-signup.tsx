import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Define the form schema
const formSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(2, 'Password must be at least 2 characters'),
})

export function SupabaseSignupForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	const navigate = useNavigate()
	const [status, setStatus] = useState<
		'idle' | 'pending' | 'success' | 'error'
	>('idle')
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setStatus('pending')
		setErrorMessage(null)

		try {
			const supabase = getSupabaseBrowserClient()
			const { error, data } = await supabase.auth.signUp({
				email: values.email,
				password: values.password,
			})

			if (error) {
				setStatus('error')
				setErrorMessage(error.message)
				return
			}

			setStatus('success')
			setSuccessMessage('Check your email for the confirmation link.')
		} catch (error) {
			console.error('Signup error:', error)
			setStatus('error')
			setErrorMessage('An error occurred during signup. Please try again.')
		}
	}

	return (
		<div className={cn('flex w-full flex-col gap-4', className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Sign Up</CardTitle>
					<CardDescription>Create an account to get started</CardDescription>
				</CardHeader>
				<CardContent>
					{successMessage ? (
						<div className='bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-md mb-4'>
							{successMessage}
						</div>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='flex flex-col gap-6'
							>
								<FormField
									control={form.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													placeholder='m@example.com'
													type='email'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='password'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input type='password' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Show form-level errors or API errors */}
								{form.formState.errors.root && (
									<div className='text-sm text-destructive'>
										{form.formState.errors.root.message}
									</div>
								)}

								{errorMessage && (
									<div className='text-sm text-destructive'>{errorMessage}</div>
								)}

								<Button
									type='submit'
									className='w-full rounded'
									disabled={status === 'pending'}
								>
									{status === 'pending' ? 'Signing up...' : 'Sign Up'}
								</Button>
							</form>
						</Form>
					)}
					<div className='text-center text-sm pt-6'>
						Already have an account?{' '}
						<Link to='/auth/login' className='underline underline-offset-4'>
							Login
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
