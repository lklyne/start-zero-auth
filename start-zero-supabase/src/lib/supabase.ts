import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie } from '@tanstack/react-start/server'

export function getSupabaseServerClient() {
	const url = import.meta.env.VITE_SUPABASE_URL
	const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
	if (!url || !anon) throw new Error('Missing Supabase environment variables')

	return createServerClient(url, anon, {
		cookies: {
			// @ts-ignore Wait till Supabase overload works
			getAll() {
				return Object.entries(parseCookies()).map(([name, value]) => ({
					name,
					value,
				}))
			},
			setAll(cookies) {
				for (const cookie of cookies) {
					const cookieOptions = {
						// Default expiration - 30 days
						maxAge: 30 * 24 * 60 * 60,
						path: '/',
						...cookie.options,
					}
					setCookie(cookie.name, cookie.value, cookieOptions)
				}
			},
		},
	})
}
