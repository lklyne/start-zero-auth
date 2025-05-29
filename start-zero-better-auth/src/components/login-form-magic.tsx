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
import {
	signIn,
	signInWithGoogle,
	signInWithMagicLink,
} from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandGoogle } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Define the form schema
const formSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
})

export function LoginFormMagic({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
		},
	})

	const navigate = useNavigate()
	const [isPending, setIsPending] = React.useState(false)
	const [emailSent, setEmailSent] = React.useState(false)

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsPending(true)
		try {
			const { data, error } = await signInWithMagicLink(values.email)
			if (error) {
				form.setError('root', {
					message: error.message || 'Failed to send magic link',
				})
			} else {
				form.reset()
				setEmailSent(true)
			}
		} catch (error) {
			console.error('Magic link error:', error)
			form.setError('root', {
				message: 'An error occurred. Please try again.',
			})
		} finally {
			setIsPending(false)
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
		<div className={cn('flex w-full flex-col gap-6', className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Login</CardTitle>
					<CardDescription>
						Sign in or create an account to get started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!emailSent && (
						<Button
							variant='outline'
							className='w-full mt-4 rounded'
							onClick={handleGoogleSignIn}
							type='button'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								x='0px'
								y='0px'
								width='100'
								height='100'
								viewBox='0 0 48 48'
								role='img'
								className='mr-2'
							>
								<title>Google</title>
								<path
									fill='#FFC107'
									d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
								/>
								<path
									fill='#FF3D00'
									d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
								/>
								<path
									fill='#4CAF50'
									d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
								/>
								<path
									fill='#1976D2'
									d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
								/>
							</svg>
							Continue with Google
						</Button>
					)}
					{emailSent ? (
						<div className='flex flex-col items-center gap-4 py-8'>
							{/* <Loader2 className='h-8 w-8 animate-spin text-primary' /> */}
							<p className='text-center text-base'>
								Check your email for a login link.
							</p>
						</div>
					) : (
						<>
							<div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border py-6'>
								<span className='relative z-10 bg-background px-2 text-muted-foreground text-xs'>
									OR
								</span>
							</div>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className='flex flex-col gap-4'
								>
									{/* Show form-level errors if any */}
									{form.formState.errors.root && (
										<div className='text-sm text-destructive'>
											{form.formState.errors.root.message}
										</div>
									)}

									<FormField
										control={form.control}
										name='email'
										render={({ field }) => (
											<FormItem>
												{/* <FormLabel>Email</FormLabel> */}
												<FormControl>
													<Input
														placeholder='Enter your email address'
														type='email'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type='submit'
										className='w-full rounded'
										disabled={isPending}
									>
										{isPending ? (
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										) : null}
										Continue with Email
									</Button>
								</form>
							</Form>
							<p className='text-sm text-center text-balance pt-8 text-muted-foreground'>
								By continuing, you agree to our{' '}
								<Link
									to='/terms-of-service'
									className='underline underline-offset-2 hover:text-primary'
								>
									Terms of Service
								</Link>{' '}
								and{' '}
								<Link
									to='/privacy-policy'
									className='underline underline-offset-2 hover:text-primary'
								>
									Privacy Policy
								</Link>
								.
							</p>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
