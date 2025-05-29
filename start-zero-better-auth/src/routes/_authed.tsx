import type { AuthData } from '@/server/db/zero-permissions'

import { authAtom } from '@/lib/zero-setup'
import { decodeAuthJwt, fetchAuthJwt, getCachedJwt } from '@/server/auth/jwt'
import { fetchAuthSession } from '@/server/auth/session'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { useEffect } from 'react'

export const Route = createFileRoute('/_authed')({
	ssr: true,
	loader: async ({ location }) => {
		// console.log('[_authed loader] incoming request to', location.href)
		const { session } = await fetchAuthSession()
		// console.log('[_authed loader] session', session)

		if (!session) {
			throw redirect({ to: '/auth/login', search: { redirect: location.href } })
		}

		return { session }
	},
	component: AuthWrapper,
})

function setAuthAtom(jwt: string, decoded: AuthData) {
	if (authAtom.value?.encoded !== jwt) {
		authAtom.value = { encoded: jwt, decoded }
	}
}

function AuthWrapper() {
	// 2) Grab the session so React knows we're authenticated (you can show user info if you like)
	// const { session } = useLoaderData({ from: Route.id })

	// 3) On mount: first seed from localStorage, then re-validate with the server
	useEffect(() => {
		// console.log('[AuthWrapper] mount – cached JWT:', getCachedJwt())
		const cached = getCachedJwt()
		if (cached) {
			const decoded = decodeAuthJwt(cached)
			if (decoded) {
				setAuthAtom(cached, decoded)
				// console.log('[AuthWrapper] setting authAtom:', { jwt: cached, decoded })
			}
		}

		fetchAuthJwt().then(({ jwt }) => {
			if (jwt) {
				const decoded = decodeAuthJwt(jwt)
				if (decoded) {
					setAuthAtom(jwt, decoded)
					// console.log('[AuthWrapper] setting authAtom:', { jwt: jwt, decoded })
				}
			}
		})
	}, [])

	// 4) Hand off to the rest of your app
	return <Outlet />
}
