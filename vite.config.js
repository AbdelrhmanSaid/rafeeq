import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import rtlcss from 'rtlcss'

import { manifestIcons } from './src/app/pwa/manifest-icons.js'

// Files matching any of these patterns are skipped by rtlcss (already RTL-safe).
const rtlcssExcludePatterns = [/vue-sonner/]

// Allow to exclude files from rtlcss processing
function rtlcssWithExclude(options) {
  return {
    postcssPlugin: 'rtlcss-with-exclude',
    prepare(result) {
      const file = result.opts.from ?? ''
      if (rtlcssExcludePatterns.some((pattern) => pattern.test(file))) return {}

      return rtlcss(options)
    },
  }
}

// Append postcss: true to the rtlcss plugin
rtlcssWithExclude.postcss = true

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
        globIgnores: ['push/onesignal/**/*'],
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
        // Long-press (Android) / right-click (desktop) jump list on the app icon.
        shortcuts: [
          {
            name: 'القرآن الكريم',
            url: '/quran',
            icons: [{ src: 'icons/android/android-launchericon-96-96.png', sizes: '96x96' }],
          },
          {
            name: 'الأذكار',
            url: '/azkar',
            icons: [{ src: 'icons/android/android-launchericon-96-96.png', sizes: '96x96' }],
          },
          {
            name: 'الإذاعة',
            url: '/radio',
            icons: [{ src: 'icons/android/android-launchericon-96-96.png', sizes: '96x96' }],
          },
          {
            name: 'اتجاه القبلة',
            url: '/qibla',
            icons: [{ src: 'icons/android/android-launchericon-96-96.png', sizes: '96x96' }],
          },
        ],
      },
    }),
  ],

  css: {
    postcss: {
      plugins: [rtlcssWithExclude()],
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
