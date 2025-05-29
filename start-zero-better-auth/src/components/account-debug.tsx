import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { authClient } from '@/lib/auth-client'
import { useZero } from '@rocicorp/zero/react'
import { BugIcon, CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Helper function to decode Base64Url
function base64UrlDecode(inputStr: string): string {
	// Replace Base64Url specific characters
	let base64 = inputStr.replace(/-/g, '+').replace(/_/g, '/')
	// Pad string with '=' to make it valid Base64
	while (base64.length % 4) {
		base64 += '='
	}
	try {
		return atob(base64)
	} catch (e) {
		console.error('Base64Url decode failed:', e)
		return ''
	}
}

// Format time until expiration
function formatTimeUntilExpiration(exp: number): string {
	const now = Math.floor(Date.now() / 1000)
	const diff = exp - now

	if (diff <= 0) return 'Expired'
	if (diff < 60) return `${diff}s`
	if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
	return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
}

// Define proper types for our state
interface JWTHeader {
	alg?: string
	typ?: string
	kid?: string
	[key: string]: unknown
}

interface JWTPayload {
	sub?: string
	iat?: number
	exp?: number
	nbf?: number
	iss?: string
	aud?: string
	jti?: string
	[key: string]: unknown
}

interface JWKSData {
	keys?: Array<{
		kid?: string
		alg?: string
		[key: string]: unknown
	}>
	[key: string]: unknown
}

interface SessionData {
	user?: {
		id?: string
		email?: string
		name?: string
		emailVerified?: boolean
		[key: string]: unknown
	}
	provider?: string
	expiresAt?: string
	sessions?: Array<{
		id: string
		userAgent?: string
		ipAddress?: string
		expiresAt?: string
		createdAt?: string
		updatedAt?: string
		current?: boolean
	}>
	[key: string]: unknown
}

// Interface for session items from Better Auth API
interface BetterAuthSession {
	id: string
	createdAt: Date | string
	updatedAt: Date | string
	userId: string
	expiresAt: Date | string
	token: string
	ipAddress?: string | null
	userAgent?: string | null
	current?: boolean
}

interface ZeroStatusData {
	isInitialized: boolean
	userID: string
	userMode?: string
	mutatorNames?: string[]
	isAuthenticated?: boolean
	[key: string]: unknown
}

export function AccountDebug() {
	const z = useZero()
	const [jwt, setJwt] = useState<string | null>(null)
	const [decodedHeader, setDecodedHeader] = useState<JWTHeader | null>(null)
	const [decodedPayload, setDecodedPayload] = useState<JWTPayload | null>(null)
	const [jwksData, setJwksData] = useState<JWKSData | null>(null)
	const [sessionData, setSessionData] = useState<SessionData | null>(null)
	const [allSessions, setAllSessions] = useState<SessionData['sessions']>([])
	const [isLoading, setIsLoading] = useState(false)
	const [networkInfo, setNetworkInfo] = useState<{
		status?: number
		time?: number
		size?: number
	}>({})
	const [tokenExpiration, setTokenExpiration] = useState<string>('Unknown')
	const [zeroStatusData, setZeroStatusData] = useState<ZeroStatusData | null>(
		null,
	)
	const [idSyncStatus, setIdSyncStatus] = useState<{
		match: boolean
		authId?: string
		zeroId?: string
	}>({ match: false })

	const fetchToken = useCallback(async () => {
		setIsLoading(true)
		try {
			const startTime = performance.now()
			const response = await fetch('/api/auth/token')
			const endTime = performance.now()

			setNetworkInfo({
				status: response.status,
				time: Math.floor(endTime - startTime),
				size: Number.parseInt(response.headers.get('content-length') || '0'),
			})

			// Prefer getting JWT from header if available
			const authJwt = response.headers.get('set-auth-jwt')
			if (authJwt) {
				setJwt(authJwt)
			} else {
				// Fallback to response body if not in header
				const tokenData = await response.json()
				if (tokenData.token) {
					setJwt(tokenData.token)
				} else {
					setJwt(null)
				}
			}
		} catch (err) {
			console.error('Error fetching JWT:', err)
			setJwt(null)
		} finally {
			setIsLoading(false)
		}
	}, [])

	const fetchJwks = useCallback(async () => {
		try {
			const response = await fetch('/api/auth/jwks')
			const data = await response.json()
			setJwksData(data)
		} catch (err) {
			console.error('Error fetching JWKS:', err)
			setJwksData(null)
		}
	}, [])

	const fetchSession = useCallback(async () => {
		try {
			// Better Auth's getSession method
			const session = await authClient.getSession()
			setSessionData(session.data || null)

			// Also try to get all sessions
			const sessionsList = await authClient.listSessions()

			// Convert the sessions to our expected format
			const formattedSessions = (sessionsList.data || []).map(
				(session: BetterAuthSession) => ({
					id: session.id,
					userAgent: session.userAgent || undefined,
					ipAddress: session.ipAddress || undefined,
					expiresAt: session.expiresAt
						? new Date(session.expiresAt).toISOString()
						: undefined,
					createdAt: session.createdAt
						? new Date(session.createdAt).toISOString()
						: undefined,
					updatedAt: session.updatedAt
						? new Date(session.updatedAt).toISOString()
						: undefined,
					current: session.current,
				}),
			)

			setAllSessions(formattedSessions)
		} catch (err) {
			console.error('Error fetching session:', err)
			setSessionData(null)
			setAllSessions([])
		}
	}, [])

	const fetchZeroStatus = useCallback(() => {
		if (!z) {
			setZeroStatusData(null)
			return
		}

		try {
			// Get what information we can about the Zero instance
			const status: ZeroStatusData = {
				isInitialized: !!z,
				userID: z?.userID || 'unknown',
				userMode: z?.userID === 'guest' ? 'Guest Mode' : 'Authenticated',
				mutatorNames: Object.keys(z.mutate || {}),
				isAuthenticated: z?.userID !== 'guest',
			}
			setZeroStatusData(status)
		} catch (err) {
			console.error('Error getting Zero status:', err)
			setZeroStatusData(null)
		}
	}, [z])

	// Check if Better Auth and Zero user IDs match
	useEffect(() => {
		const authId = sessionData?.user?.id
		const zeroId = zeroStatusData?.userID

		if (authId && zeroId) {
			setIdSyncStatus({
				match: authId === zeroId,
				authId,
				zeroId,
			})
		} else {
			setIdSyncStatus({ match: false })
		}
	}, [sessionData, zeroStatusData])

	const revokeSession = useCallback(
		async (sessionToken: string) => {
			try {
				setIsLoading(true)
				await authClient.revokeSession({ token: sessionToken })
				// Refresh sessions list after revoking
				await fetchSession()
			} catch (err) {
				console.error('Error revoking session:', err)
			} finally {
				setIsLoading(false)
			}
		},
		[fetchSession],
	)

	const revokeAllOtherSessions = useCallback(async () => {
		try {
			setIsLoading(true)
			await authClient.revokeOtherSessions()
			// Refresh sessions list after revoking
			await fetchSession()
		} catch (err) {
			console.error('Error revoking other sessions:', err)
		} finally {
			setIsLoading(false)
		}
	}, [fetchSession])

	const fetchAllData = useCallback(() => {
		fetchToken()
		fetchJwks()
		fetchSession()
		fetchZeroStatus()
	}, [fetchToken, fetchJwks, fetchSession, fetchZeroStatus])

	// Decode JWT when it changes
	useEffect(() => {
		if (jwt) {
			try {
				// Decode header
				const headerBase64Url = jwt.split('.')[0]
				if (headerBase64Url) {
					const decodedJson = base64UrlDecode(headerBase64Url)
					setDecodedHeader(JSON.parse(decodedJson))
				} else {
					setDecodedHeader(null)
				}

				// Decode payload
				const payloadBase64Url = jwt.split('.')[1]
				if (payloadBase64Url) {
					const decodedJson = base64UrlDecode(payloadBase64Url)
					const payload = JSON.parse(decodedJson)
					setDecodedPayload(payload)

					// Set expiration time
					if (payload.exp) {
						setTokenExpiration(formatTimeUntilExpiration(payload.exp))

						// Update expiration periodically
						const interval = setInterval(() => {
							setTokenExpiration(formatTimeUntilExpiration(payload.exp))
						}, 1000)

						return () => clearInterval(interval)
					}
				} else {
					setDecodedPayload(null)
				}
			} catch (err) {
				console.error('Error decoding JWT:', err)
				setDecodedHeader(null)
				setDecodedPayload({ error: 'Failed to decode payload' })
			}
		} else {
			setDecodedHeader(null)
			setDecodedPayload(null)
		}
	}, [jwt])

	return (
		<Dialog
			onOpenChange={(open) => {
				if (open) {
					fetchAllData()
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant='outline' size='xs' className='px-2'>
					<BugIcon className='h-4 w-4' />
					Debug
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[700px]'>
				<DialogHeader>
					<DialogTitle>Debug Account</DialogTitle>
					<DialogDescription>
						View debug information about your account, JWT, and Zero sync
						status.
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-8 py-4 max-h-[600px] overflow-y-auto'>
					{/* Session Info Section */}
					<div className='flex flex-col border bg-background shadow rounded'>
						<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
							<h2 className='font-medium text-sm'>Session Info</h2>
							<span className='px-2 py-0.5 bg-blue-50/50 text-blue-800 rounded border border-blue-200 dark:bg-blue-950/40 dark:text-blue-50 dark:border-blue-900 text-sm'>
								Better Auth
							</span>
						</div>
						<div className='p-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<div className='flex items-center gap-1.5'>
										<p className='text-sm text-muted-foreground'>User ID</p>
										{idSyncStatus.authId && (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														{idSyncStatus.match ? (
															<CheckCircle2 className='w-4 h-4 text-green-500' />
														) : (
															<XCircle className='w-4 h-4 text-red-500' />
														)}
													</TooltipTrigger>
													<TooltipContent side='right'>
														<p className='text-xs max-w-[225px]'>
															{idSyncStatus.match
																? 'Auth ID and Zero ID are in sync'
																: 'Auth ID and Zero ID are not synchronized'}
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</div>
									<p className='text-sm'>
										{sessionData?.user?.id || 'Not signed in'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Email</p>
									<p className='text-sm'>{sessionData?.user?.email || 'N/A'}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Provider</p>
									<p className='text-sm'>{sessionData?.provider || 'N/A'}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Token Expires</p>
									<p className='text-sm'>{tokenExpiration}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Active Sessions */}
					{allSessions && allSessions.length > 0 && (
						<div className='flex flex-col border bg-background shadow rounded'>
							<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
								<h2 className='font-medium text-sm'>
									Active Sessions ({allSessions.length})
								</h2>
								<Button
									variant='ghost'
									size='sm'
									onClick={revokeAllOtherSessions}
									disabled={isLoading || allSessions.length <= 1}
									className='text-xs'
								>
									{isLoading ? '...' : 'Revoke Other Sessions'}
								</Button>
							</div>
							<div className='p-4'>
								<div className='space-y-3'>
									{allSessions.map((session) => (
										<div
											key={session.id}
											className='flex justify-between items-center p-2 rounded-md border bg-muted/20'
										>
											<div className='flex-1'>
												<div className='flex items-center gap-2'>
													{session.current && (
														<span className='px-1.5 py-0.5 bg-green-50/70 text-green-800 rounded text-xs'>
															Current
														</span>
													)}
													<span className='text-xs truncate max-w-[250px]'>
														{session.userAgent || 'Unknown device'}
													</span>
												</div>
												<div className='text-xs text-muted-foreground mt-1'>
													<span>
														Created:{' '}
														{new Date(session.createdAt || '').toLocaleString()}
													</span>
													{session.ipAddress && (
														<span className='ml-3'>
															IP: {session.ipAddress}
														</span>
													)}
												</div>
											</div>
											<Button
												variant='outline'
												size='sm'
												disabled={isLoading || session.current}
												onClick={() => session.id && revokeSession(session.id)}
												className='ml-2'
											>
												Revoke
											</Button>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Zero Sync Status */}
					<div className='flex flex-col border bg-background shadow rounded'>
						<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
							<h2 className='font-medium text-sm'>Zero Sync Status</h2>
							<span className='px-2 py-0.5 bg-pink-50/50 text-pink-800 rounded border border-pink-200 dark:bg-pink-950/40 dark:text-pink-50 dark:border-pink-900 text-sm'>
								Zero
							</span>
						</div>
						<div className='p-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<div className='flex items-center gap-1.5'>
										<p className='text-sm text-muted-foreground'>
											Zero User ID
										</p>
										{idSyncStatus.zeroId && (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														{idSyncStatus.match ? (
															<CheckCircle2 className='w-4 h-4 text-green-500' />
														) : (
															<XCircle className='w-5 h-5 text-red-500' />
														)}
													</TooltipTrigger>
													<TooltipContent side='right'>
														<p className='text-xs max-w-[225px]'>
															{idSyncStatus.match
																? 'Zero ID and Auth ID are in sync'
																: 'Zero ID and Auth ID are not synchronized'}
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</div>
									<p className='text-sm'>{zeroStatusData?.userID || 'N/A'}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Initialized</p>
									<p className='text-sm'>
										{zeroStatusData?.isInitialized ? 'Yes' : 'No'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										Available Mutators
									</p>
									<p className='text-sm'>
										{zeroStatusData?.mutatorNames?.join(', ') || 'None'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>User Mode</p>
									<p className='text-sm'>
										{zeroStatusData?.userMode || 'Unknown'}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Network & Environment */}
					<div className='flex flex-col border bg-background shadow rounded'>
						<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
							<h2 className='font-medium text-sm'>Network & Environment</h2>
							<span className='px-2 py-0.5 bg-green-50/50 text-green-800 rounded border border-green-200 dark:bg-green-950/40 dark:text-green-50 dark:border-green-900 text-sm'>
								Connectivity
							</span>
						</div>
						<div className='p-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-muted-foreground'>Token Status</p>
									<p className='text-sm'>{networkInfo.status || 'N/A'}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										Token Response Time
									</p>
									<p className='text-sm'>
										{networkInfo.time ? `${networkInfo.time}ms` : 'N/A'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>Server URL</p>
									<p className='text-sm'>
										{import.meta.env.VITE_PUBLIC_SERVER || 'Not configured'}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>JWKS Keys</p>
									<p className='text-sm'>
										{jwksData?.keys
											? `${jwksData.keys.length} available`
											: 'N/A'}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* JWT Data */}
					<div className='flex flex-col border bg-background shadow rounded'>
						<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
							<h2 className='font-medium text-sm'>JWT Details</h2>
							<span className='px-2 py-0.5 bg-amber-50/50 text-amber-800 rounded border border-amber-200 dark:bg-amber-950/40 dark:text-amber-50 dark:border-amber-900 text-sm'>
								Token
							</span>
						</div>
						<div className='p-4 space-y-4'>
							{jwt && (
								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div>
											<p className='text-sm text-muted-foreground'>Algorithm</p>
											<p className='text-sm'>{decodedHeader?.alg || 'N/A'}</p>
										</div>
										<div>
											<p className='text-sm text-muted-foreground'>Key ID</p>
											<p className='text-sm'>{decodedHeader?.kid || 'N/A'}</p>
										</div>
										<div>
											<p className='text-sm text-muted-foreground'>Issued At</p>
											<p className='text-sm'>
												{decodedPayload?.iat
													? new Date(decodedPayload.iat * 1000).toLocaleString()
													: 'N/A'}
											</p>
										</div>
										<div>
											<p className='text-sm text-muted-foreground'>
												Expires At
											</p>
											<p className='text-sm'>
												{decodedPayload?.exp
													? new Date(decodedPayload.exp * 1000).toLocaleString()
													: 'N/A'}
											</p>
										</div>
									</div>

									<div className='space-y-2'>
										<h4 className='font-medium text-sm'>JWT Header:</h4>
										<pre className='bg-muted p-4 rounded-md overflow-auto text-xs'>
											{JSON.stringify(decodedHeader, null, 2)}
										</pre>
									</div>

									<div className='space-y-2'>
										<h4 className='font-medium text-sm'>JWT Payload:</h4>
										<pre className='bg-muted p-4 rounded-md overflow-auto text-xs'>
											{JSON.stringify(decodedPayload, null, 2)}
										</pre>
									</div>

									<div className='space-y-2'>
										<h4 className='font-medium text-sm'>Raw JWT:</h4>
										<pre className='bg-muted p-4 rounded-md overflow-auto text-xs'>
											{jwt}
										</pre>
									</div>
								</div>
							)}

							{!jwt && (
								<p className='text-sm text-muted-foreground'>
									No JWT available
								</p>
							)}
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant='secondary'
						type='button'
						onClick={fetchAllData}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<RefreshCw className='h-4 w-4 mr-2 animate-spin' />
								Refreshing...
							</>
						) : (
							<>
								<RefreshCw className='h-4 w-4 mr-2' />
								Refresh Data
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
