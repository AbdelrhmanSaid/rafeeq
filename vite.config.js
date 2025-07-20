import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import rtlcss from 'rtlcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}'],
        runtimeCaching: [
          // Cache Azkar JSON files
          {
            urlPattern: /^.*\/data\/azkar\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'azkar-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Cache Quran API responses
          {
            urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'quran-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
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
          // Cache fonts
          {
            urlPattern: /^.*\.(ttf|woff|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          // Cache images
          {
            urlPattern: /^.*\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
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
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
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
