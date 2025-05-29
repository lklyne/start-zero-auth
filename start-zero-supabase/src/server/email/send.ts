import { render } from '@react-email/render'
import { resend } from './client'

interface SendEmailOptions {
	to: string | string[]
	subject: string
	react: React.ReactElement
}

// Response interface matching Resend's actual response format
export interface EmailResponse {
	id: string
}

export async function sendEmail({
	to,
	subject,
	react,
}: SendEmailOptions): Promise<EmailResponse> {
	if (!process.env.EMAIL_FROM) {
		throw new Error('Missing EMAIL_FROM environment variable')
	}

	console.log('📧 Sending email:')
	console.log('   - From:', process.env.EMAIL_FROM)
	console.log('   - To:', Array.isArray(to) ? to.join(', ') : to)
	console.log('   - Subject:', subject)

	// Properly render the React component to HTML
	// The result from render() is a string or Promise<string>
	const renderResult = render(react, { pretty: true })
	const html =
		typeof renderResult === 'string' ? renderResult : await renderResult

	// Log a small snippet of the HTML to verify it looks good
	console.log(`   - HTML Preview: ${html.substring(0, 100)}...`)

	try {
		console.log('📤 Calling Resend API...')

		// Send the email using Resend
		const response = await resend.emails.send({
			from: process.env.EMAIL_FROM,
			to,
			subject,
			html,
		})

		console.log('✅ Resend API response:', response)

		// Safely extract the ID from the response
		// Based on Resend's API documentation, the successful response contains an 'id' field
		const id =
			response && typeof response === 'object' && 'id' in response
				? String(response.id)
				: 'unknown'

		return { id }
	} catch (error) {
		console.error('❌ Resend API error:', error)
		throw error
	}
}
