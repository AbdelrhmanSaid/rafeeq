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
    // Node 22+ ships experimental webstorage globals; without
    // --localstorage-file its localStorage is a getter returning
    // undefined, and it shadows jsdom's working implementation.
    execArgv: ['--no-experimental-webstorage'],
  },
})
