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
    setupFiles: ['src/test/setup.js'],
    restoreMocks: true,
    coverage: {
      all: true,
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/**/*.spec.js', 'src/**/data/**', 'src/app/main.js', 'src/test/**'],
    },
  },
})
