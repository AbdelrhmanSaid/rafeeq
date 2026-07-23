import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import rtlcss from 'rtlcss'

import { manifestIcons } from './src/app/pwa/manifest-icons.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      cleanupOutdatedCaches: true,
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}'],
        // QCF mushaf fonts (~46 MB across 605 files) are loaded on demand and
        // cached explicitly (qcfFontCache.js) — never precached.
        globIgnores: ['push/onesignal/**/*', 'fonts/qcfv1/**'],
        runtimeCaching: [
          // Cache Prayer Times API responses
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/v1\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'prayer-times-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 12, // 12 hours
              },
              networkTimeoutSeconds: 5,
            },
          },
          // QCF mushaf page fonts — same cache name as qcfFontCache.js so
          // SW-intercepted loads and explicit surah downloads share one store.
          {
            urlPattern: /\/fonts\/qcfv1\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'qcf-v1-fonts',
            },
          },
          // Cache fonts
          {
            urlPattern: /^.*\.(ttf|woff|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
            },
          },
          // Cache images
          {
            urlPattern: /^.*\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
            },
          },
        ],
      },
      manifest: {
        name: 'رفيق - زادك في الطريق',
        short_name: 'رفيق',
        description: 'تطبيق إسلامي شامل للأذكار والقرآن الكريم ومواقيت الصلاة',
        theme_color: '#795547',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: manifestIcons,
      },
    }),
  ],

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
