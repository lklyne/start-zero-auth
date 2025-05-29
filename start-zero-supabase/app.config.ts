import { defineConfig } from '@tanstack/react-start/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  tsr: {
    appDirectory: 'src',
    // routeToken: 'layout', // I can't stand that this isn't the default - this is for the layout route file
  },

  server: {
    prerender: {
      routes: [
        '/',
        '/app',
        '/app/zero-mutations',
        // Add other critical routes
      ],
      crawlLinks: true,
    },
  },
  
  vite: {
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
})
