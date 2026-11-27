import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import rtlcss from 'rtlcss'

import { manifestIcons } from './src/app/pwa/manifest-icons.js'
import { manifestScreenshots } from './src/app/pwa/manifest-screenshots.js'

// These packages are already RTL-safe.
const rtlcssExcludePatterns = [/vue-sonner/]

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

rtlcssWithExclude.postcss = true

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
        // Not needed offline: store screenshots, iOS splash images (read only on add-to-home-screen), and the ~48 MB
        // of Mushaf page fonts, which the reader stores itself as pages are read or downloaded.
        globIgnores: ['push/onesignal/**/*', 'screenshots/**/*', 'splash/**/*', 'fonts/mushaf/**/*'],
        runtimeCaching: [
          {
            // Mushaf page fonts have their own cache (src/features/quran/lib/mushafStorage.js).
            urlPattern: ({ url }) => !url.pathname.startsWith('/fonts/mushaf/') && /\.(ttf|woff2?)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
            },
          },
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
        // A stable identity, so a future change to start_url doesn't install as a new app.
        id: '/',
        lang: 'ar',
        dir: 'rtl',
        // No theme_color, so the installed app's bars follow the page's theme-color meta. Explicitly undefined because
        // vite-plugin-pwa otherwise merges in a default; JSON.stringify drops the key.
        theme_color: undefined,
        // Matches the maskable icon's fill, so Android 12+'s circle-cropped splash icon shows only the mark.
        background_color: '#f2ebe2',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: manifestIcons,
        screenshots: manifestScreenshots,
        shortcuts: [
          {
            name: 'القرآن الكريم',
            url: '/quran',
            icons: [{ src: 'icons/shortcut-quran.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'الأذكار',
            url: '/azkar',
            icons: [{ src: 'icons/shortcut-azkar.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'الإذاعة',
            url: '/radio',
            icons: [{ src: 'icons/shortcut-radio.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'اتجاه القبلة',
            url: '/qibla',
            icons: [{ src: 'icons/shortcut-qibla.png', sizes: '96x96', type: 'image/png' }],
          },
        ],
      },
    }),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import'],
      },
    },
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
