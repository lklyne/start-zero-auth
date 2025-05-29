import { sendEmail } from '@/server/email/send'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import React from 'react'
import { z } from 'zod'

// Create schema for email request validation
const emailSchema = z.object({
	to: z.union([z.string().email(), z.array(z.string().email())]),
	subject: z.string().min(1),
	templateName: z.string().min(1),
	data: z.record(z.unknown()),
})

export const APIRoute = createAPIFileRoute('/api/email/send')({
	POST: async ({ request }) => {
		try {
			// Parse the request body
			const body = await request.json()

			// Validate body
			const validatedBody = emailSchema.parse(body)
			const { to, subject, templateName, data } = validatedBody

			// Dynamically import the template
			const templateModule = await import(
				`./src/emails/templates/${templateName}`
			)
			const Template = templateModule.default

			if (!Template) {
				throw new Error(`Email template '${templateName}' not found`)
			}

			const result = await sendEmail({
				to,
				subject,
				react: React.createElement(Template, data),
			})

			return new Response(
				JSON.stringify({
					success: true,
					messageId:
						typeof result === 'object' && result !== null
							? result.id
							: undefined,
				}),
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			)
		} catch (error) {
			console.error('Failed to send email:', error)

			return new Response(
				JSON.stringify({
					success: false,
					error:
						error instanceof Error ? error.message : 'Failed to send email',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			)
		}
	},
})
