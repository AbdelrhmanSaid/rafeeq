import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Dedicated Vitest config. We intentionally avoid loading the PWA/rtlcss
// plugins from vite.config.js here, since they are irrelevant to unit tests
// and slow the suite down.
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  test: {
    environment: 'happy-dom',
    environmentOptions: {
      // External script loading is disabled in the test environment; treat it
      // as a no-op success instead of throwing, so analytics tests that inject
      // a <script> tag don't spam the console with DOMExceptions.
      happyDOM: { settings: { handleDisabledFileLoadingAsSuccess: true } },
    },
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.{test,spec}.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/main.js', 'src/exports/**', 'src/components/icons/**', 'src/**/*.d.ts'],
    },
  },
})
