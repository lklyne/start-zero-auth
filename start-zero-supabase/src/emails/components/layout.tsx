import { Body, Container, Head, Html } from '@react-email/components'

export interface LayoutProps {
	children: React.ReactNode
	preview?: string
}

export default function Layout({ children, preview }: LayoutProps) {
	return (
		<Html>
			<Head>{preview && <meta name='description' content={preview} />}</Head>
			<Body
				style={{
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					margin: '0',
					padding: '0',
					backgroundColor: '#f9f9f9',
					color: '#333333',
				}}
			>
				<Container
					style={{
						maxWidth: '600px',
						margin: '0 auto',
						padding: '20px',
						backgroundColor: '#ffffff',
						borderRadius: '5px',
						boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
					}}
				>
					{children}
				</Container>
			</Body>
		</Html>
	)
}
