import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import rtlcss from 'rtlcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  css: {
    postcss: {
      plugins: [rtlcss()],
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
