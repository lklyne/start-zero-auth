import NavApp from '@/components/nav-app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { sendEmail } from '@/lib/email-client'
import type {
	EmailTemplateName,
	NotificationEmailData,
	WelcomeEmailData,
} from '@/lib/email-client'
import { createFileRoute } from '@tanstack/react-router'
import { Check, CircleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/app/_layout/email-preview')({
	component: EmailPreview,
})

function EmailPreview() {
	// Template name state
	const [templateName, setTemplateName] = useState<EmailTemplateName>('welcome')

	// Welcome email data
	const [welcomeData, setWelcomeData] = useState<WelcomeEmailData>({
		username: 'User',
		verifyUrl: 'https://example.com/verify',
	})

	// Notification email data
	const [notificationData, setNotificationData] =
		useState<NotificationEmailData>({
			username: 'User',
			message: 'This is a notification message.',
			actionUrl: 'https://example.com/action',
			actionText: 'Click here',
		})

	// Email state
	const [emailState, setEmailState] = useState({
		to: '',
		subject: '',
		loading: false,
		success: false,
		error: '',
	})

	// Get the current template data based on the selected template
	const getCurrentTemplateData = () => {
		return templateName === 'welcome' ? welcomeData : notificationData
	}

	const handleSendEmail = async () => {
		setEmailState((prev) => ({
			...prev,
			loading: true,
			success: false,
			error: '',
		}))

		try {
			const result = await sendEmail({
				to: emailState.to,
				subject: emailState.subject,
				templateName,
				data: getCurrentTemplateData(),
			})

			if (result.success) {
				setEmailState((prev) => ({ ...prev, loading: false, success: true }))
				toast.success('Email sent successfully!')
			} else {
				setEmailState((prev) => ({
					...prev,
					loading: false,
					error: result.error || 'Failed to send email',
				}))
				toast.error(result.error || 'Failed to send email')
			}
		} catch (error) {
			setEmailState((prev) => ({
				...prev,
				loading: false,
				error: error instanceof Error ? error.message : 'Failed to send email',
			}))
			toast.error('Failed to send email')
		}
	}

	return (
		<div className='container flex flex-col h-full overflow-y-auto'>
			<NavApp title='Email Preview & Testing' />
			<div className='flex flex-col grow overflow-y-auto p-4'>
				<div className='flex flex-col gap-8'>
					<div className='flex flex-col gap-4 max-w-2xl'>
						<div className='border rounded-lg bg-background p-4'>
							<h2 className='text-base font-medium mb-2'>
								Email Configuration
							</h2>
							<p className='text-sm text-muted-foreground mb-4'>
								Configure and send a test email
							</p>
							<div className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='recipient'>Recipient Email</Label>
									<Input
										id='recipient'
										placeholder='recipient@example.com'
										value={emailState.to}
										onChange={(e) =>
											setEmailState((prev) => ({
												...prev,
												to: e.target.value,
											}))
										}
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='subject'>Subject</Label>
									<Input
										id='subject'
										placeholder='Welcome to our platform'
										value={emailState.subject}
										onChange={(e) =>
											setEmailState((prev) => ({
												...prev,
												subject: e.target.value,
											}))
										}
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='template'>Email Template</Label>
									<Select
										value={templateName}
										onValueChange={(value) =>
											setTemplateName(value as EmailTemplateName)
										}
									>
										<SelectTrigger id='template'>
											<SelectValue placeholder='Select a template' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='welcome'>Welcome Email</SelectItem>
											<SelectItem value='notification'>Notification</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='pt-4'>
									<Button
										onClick={handleSendEmail}
										variant='default'
										disabled={
											emailState.loading ||
											!emailState.to ||
											!emailState.subject
										}
										className='w-full rounded'
									>
										{emailState.loading ? 'Sending...' : 'Send Test Email'}
									</Button>
								</div>

								{emailState.success && (
									<div className='flex items-center text-green-500 mt-2'>
										<Check size={16} className='mr-1' />
										<span>Email sent successfully!</span>
									</div>
								)}

								{emailState.error && (
									<div className='flex items-center text-red-500 mt-2'>
										<CircleAlert size={16} className='mr-1' />
										<span>{emailState.error}</span>
									</div>
								)}
							</div>
						</div>

						<div className='border rounded-lg bg-background p-4'>
							<h2 className='text-base font-medium mb-2'>Template Data</h2>
							<p className='text-sm text-muted-foreground mb-4'>
								Customize the data that will be used to render the selected
								template
							</p>
							<div className='space-y-4'>
								{templateName === 'welcome' && (
									<>
										<div className='space-y-2'>
											<Label htmlFor='username'>Username</Label>
											<Input
												id='username'
												value={welcomeData.username}
												onChange={(e) =>
													setWelcomeData((prev) => ({
														...prev,
														username: e.target.value,
													}))
												}
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='verifyUrl'>Verification URL</Label>
											<Input
												id='verifyUrl'
												value={welcomeData.verifyUrl}
												onChange={(e) =>
													setWelcomeData((prev) => ({
														...prev,
														verifyUrl: e.target.value,
													}))
												}
											/>
										</div>
									</>
								)}

								{templateName === 'notification' && (
									<>
										<div className='space-y-2'>
											<Label htmlFor='username'>Username</Label>
											<Input
												id='username'
												value={notificationData.username}
												onChange={(e) =>
													setNotificationData((prev) => ({
														...prev,
														username: e.target.value,
													}))
												}
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='message'>Message</Label>
											<Textarea
												id='message'
												value={notificationData.message}
												onChange={(e) =>
													setNotificationData((prev) => ({
														...prev,
														message: e.target.value,
													}))
												}
												rows={4}
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='actionUrl'>Action URL (optional)</Label>
											<Input
												id='actionUrl'
												value={notificationData.actionUrl || ''}
												onChange={(e) =>
													setNotificationData((prev) => ({
														...prev,
														actionUrl: e.target.value,
													}))
												}
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='actionText'>Action Text (optional)</Label>
											<Input
												id='actionText'
												value={notificationData.actionText || ''}
												onChange={(e) =>
													setNotificationData((prev) => ({
														...prev,
														actionText: e.target.value,
													}))
												}
											/>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
