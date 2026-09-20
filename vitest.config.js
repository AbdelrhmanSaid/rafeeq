import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.js'],
    restoreMocks: true,
    // Prevent Node's experimental globals from shadowing jsdom's localStorage.
    execArgv: ['--no-experimental-webstorage'],
  },
})
