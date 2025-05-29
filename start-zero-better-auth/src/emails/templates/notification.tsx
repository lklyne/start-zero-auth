import { Heading, Hr, Section, Text } from '@react-email/components'
import Layout from '../components/layout'

interface NotificationEmailProps {
	username: string
	message: string
	actionUrl?: string
	actionText?: string
}

export default function NotificationEmail({
	username,
	message,
	actionUrl,
	actionText,
}: NotificationEmailProps) {
	return (
		<Layout preview='You have a new notification'>
			<Heading>Hello, {username}!</Heading>
			<Text>{message}</Text>

			{actionUrl && actionText && (
				<Section>
					<Hr style={{ margin: '24px 0' }} />
					<Text>
						<a
							href={actionUrl}
							style={{ color: '#3b82f6', textDecoration: 'underline' }}
						>
							{actionText}
						</a>
					</Text>
				</Section>
			)}
		</Layout>
	)
}
