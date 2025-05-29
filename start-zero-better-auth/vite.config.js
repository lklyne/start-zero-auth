import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { resolve } from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({
			target: 'react',
			autoCodeSplitting: true,
			routeFileIgnorePattern: 'api/*',
		}),
		react(),
		tailwindcss(),
	],
	test: {
		globals: true,
		environment: 'jsdom',
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
})
