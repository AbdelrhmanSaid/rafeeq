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
        // Store screenshots are for the store listings, not something the app needs offline. The iOS splash images
        // are only read by iOS when the app is added to the home screen, so they aren't precached either. The 604
        // Mushaf page fonts (about 48 MB) are stored as pages are read or downloaded, by the reader itself.
        globIgnores: ['push/onesignal/**/*', 'screenshots/**/*', 'splash/**/*', 'fonts/mushaf/**/*'],
        runtimeCaching: [
          {
            // Mushaf page fonts keep their own cache (see src/features/quran/lib/mushafStorage.js), so they aren't
            // stored twice.
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
        // No theme_color: an installed app lets the manifest's value override the page's theme-color meta, which
        // pins the system bars to one color instead of following the chosen theme. It's set to undefined, not
        // left out, because vite-plugin-pwa merges in a default (Vue green); JSON.stringify then drops the key.
        theme_color: undefined,
        // The maskable icon's flat fill. Android 12+ draws the splash as that icon, cropped to a circle, on this
        // color, so matching them hides the circle and leaves only the mark.
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
