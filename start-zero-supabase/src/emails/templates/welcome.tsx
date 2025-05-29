import { Button, Heading, Section, Text } from '@react-email/components'
import Layout from '../components/layout'

interface WelcomeEmailProps {
	username: string
	verifyUrl: string
}

export default function WelcomeEmail({
	username,
	verifyUrl,
}: WelcomeEmailProps) {
	return (
		<Layout preview='Welcome to our platform!'>
			<Heading
				style={{
					color: '#333',
					fontSize: '24px',
					fontWeight: 'bold',
					margin: '20px 0',
					textAlign: 'center',
				}}
			>
				Welcome, {username}!
			</Heading>

			<Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#444' }}>
				We're excited to have you on board. Thank you for joining our platform!
			</Text>

			<Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#444' }}>
				To get started, please verify your email address by clicking the button
				below.
			</Text>

			<Section style={{ textAlign: 'center', margin: '30px 0' }}>
				<Button
					href={verifyUrl}
					style={{
						backgroundColor: '#3b82f6',
						borderRadius: '4px',
						color: '#fff',
						fontWeight: 'bold',
						padding: '12px 20px',
						textDecoration: 'none',
						textTransform: 'uppercase',
						fontSize: '14px',
					}}
				>
					Verify Email
				</Button>
			</Section>

			<Text style={{ fontSize: '14px', color: '#666', marginTop: '30px' }}>
				If you have any questions, feel free to reach out to our support team.
			</Text>

			<Text style={{ fontSize: '14px', color: '#666' }}>
				Best regards,
				<br />
				The Team
			</Text>
		</Layout>
	)
}
