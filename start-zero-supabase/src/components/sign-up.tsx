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
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Define the form schema
const formSchema = z
	.object({
		email: z.string().email('Please enter a valid email address'),
		name: z.string().min(1, 'Name cannot be empty'),
		password: z.string().min(2, 'Password must be at least 2 characters'),
		confirmPassword: z
			.string()
			.min(2, 'Password must be at least 2 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

type FormData = z.infer<typeof formSchema>

interface SignUpProps {
	className?: string
}

export function SignUp({ className }: SignUpProps) {
	const navigate = useNavigate()
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			name: '',
			password: '',
			confirmPassword: '',
		},
	})

	async function onSubmit(values: FormData) {
		form.clearErrors()
		try {
			const { data, error } = await authClient.signUp.email(
				{
					email: values.email,
					name: values.name,
					password: values.password,
				},
				{
					onSuccess: () => {
						navigate({ to: '/app' })
					},
					onError: (ctx) => {
						form.setError('root', {
							message: ctx.error.message || 'Failed to create account',
						})
					},
				},
			)
			if (error) {
				console.warn('Sign up error data:', error)
			} else if (data) {
				console.log('Sign up success data:', data)
			}
		} catch (error) {
			form.setError('root', {
				message: 'An unexpected error occurred during registration',
			})
			console.error('Signup error:', error)
		}
	}

	return (
		<Card className={cn('w-full', className)}>
			<CardHeader>
				<CardTitle className='text-2xl'>Create an account</CardTitle>
				<CardDescription>
					Enter your email below to create your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='flex flex-col gap-5'
					>
						{/* Show form-level errors if any */}
						{form.formState.errors.root && (
							<div className='text-sm text-destructive'>
								{form.formState.errors.root.message}
							</div>
						)}

						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder='Your Name' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
						<FormField
							control={form.control}
							name='confirmPassword'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input type='password' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type='submit' className='w-full'>
							Create account
						</Button>
						<Button variant='outline' className='w-full'>
							Sign up with Google
						</Button>
						<div className='mt-4 text-center text-sm'>
							Already have an account?{' '}
							<Link to='/auth/login' className='underline underline-offset-4'>
								Login
							</Link>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
