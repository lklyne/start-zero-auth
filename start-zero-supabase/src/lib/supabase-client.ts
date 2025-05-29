import { createBrowserClient } from '@supabase/ssr'

export function getSupabaseBrowserClient() {
	const url = import.meta.env.VITE_SUPABASE_URL
	const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
	if (!url || !anon) throw new Error('Missing Supabase environment variables')

	return createBrowserClient(url, anon)
}
