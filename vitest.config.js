import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // jsdom only exposes localStorage for a real origin.
    environmentOptions: { jsdom: { url: 'http://localhost:5173' } },
    globals: true,
    include: ['src/**/*.spec.{js,jsx}'],
    setupFiles: ['./vitest.setup.js'],
    restoreMocks: true,
  },
})
