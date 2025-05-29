'use client'

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
import { signIn, signInWithGoogle } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Define the form schema
const formSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(2, 'Password must be at least 2 characters'),
})

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const navigate = useNavigate()

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			// Use the imported signIn function directly
			const { data, error } = await signIn.email({
				email: values.email,
				password: values.password,
			})

			if (data) {
				// Redirect to dashboard or home page after successful login
				navigate({ to: '/app' })
			} else {
				// Handle login failure - attempt to parse error message if available
				let errorMessage = 'Invalid email or password'
				try {
					if (error) {
						errorMessage = error.message || 'Invalid email or password'
					}
				} catch (parseError) {
					// Ignore if response body is not JSON or empty
					console.error('Error parsing login error response:', parseError)
				}
				form.setError('root', {
					message: errorMessage,
				})
			}
		} catch (error) {
			// Handle any unexpected network errors
			console.error('Login error:', error)
			form.setError('root', {
				// Provide a generic error message for unexpected issues
				message: 'An error occurred during login. Please try again.',
			})
		}
	}

	// Added async handler for Google Sign In
	const handleGoogleSignIn = async () => {
		try {
			await signInWithGoogle()
			// The signInWithGoogle function itself handles redirection or token processing.
			// You might not need to navigate manually here unless you want specific behavior
			// after returning from Google. The better-auth library should handle the session update.
		} catch (error) {
			console.error('Google Sign-In error:', error)
			// Optionally, set a form error or show a toast notification
			form.setError('root', {
				message: 'Failed to sign in with Google. Please try again.',
			})
		}
	}

	return (
		<div className={cn('flex w-full flex-col gap-4', className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Login</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant='outline'
						className='w-full flex items-center gap-2 rounded'
						onClick={handleGoogleSignIn}
						type='button'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							height='24'
							viewBox='0 0 24 24'
							width='24'
							type='image/svg+xml'
						>
							<title>Google</title>
							<path
								d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
								fill='#4285F4'
							/>
							<path
								d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
								fill='#34A853'
							/>
							<path
								d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
								fill='#FBBC05'
							/>
							<path
								d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
								fill='#EA4335'
							/>
							<path d='M1 1h22v22H1z' fill='none' />
						</svg>
						Continue with Google
					</Button>
					<div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border py-6'>
						<span className='relative z-10 bg-background px-2 text-muted-foreground'>
							Or
						</span>
					</div>
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

							{/* Show form-level errors if any */}
							{form.formState.errors.root && (
								<div className='text-sm text-destructive'>
									{form.formState.errors.root.message}
								</div>
							)}

							<Button type='submit' className='w-full rounded'>
								Login
							</Button>
						</form>
					</Form>
					<div className='text-center text-sm pt-6'>
						Don&apos;t have an account?{' '}
						<Link to='/auth/signup' className='underline underline-offset-4'>
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
