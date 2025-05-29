/**
 * Email client for sending emails from the client side
 */

// Define types for specific email templates
export interface WelcomeEmailData {
	username: string
	verifyUrl: string
}

export interface NotificationEmailData {
	username: string
	message: string
	actionUrl?: string
	actionText?: string
}

// Map template names to their data types
export type EmailTemplateData = {
	welcome: WelcomeEmailData
	notification: NotificationEmailData
}

// Template name type
export type EmailTemplateName = keyof EmailTemplateData

// Generic send email options type
export interface SendEmailOptions<T extends EmailTemplateName> {
	to: string | string[]
	subject: string
	templateName: T
	data: EmailTemplateData[T]
}

/**
 * Send an email using the configured templates
 */
export async function sendEmail<T extends EmailTemplateName>({
	to,
	subject,
	templateName,
	data,
}: SendEmailOptions<T>): Promise<{
	success: boolean
	messageId?: string
	error?: string
}> {
	try {
		const response = await fetch('/api/email/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				to,
				subject,
				templateName,
				data,
			}),
		})

		if (!response.ok) {
			const errorData = await response.json()
			return {
				success: false,
				error: errorData.error || 'Failed to send email',
			}
		}

		const result = await response.json()
		return {
			success: true,
			messageId: result.messageId,
		}
	} catch (error) {
		console.error('Error sending email:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to send email',
		}
	}
}
