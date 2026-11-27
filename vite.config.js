import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import rtlcss from 'rtlcss'

import { manifestIcons } from './src/app/pwa/manifest-icons.js'
import { manifestScreenshots } from './src/app/pwa/manifest-screenshots.js'
import { sitemapXml } from './src/app/sitemap.js'
import { QURAN_TEXT_PATH, quranVerses } from './src/features/quran/lib/quranText.js'

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

function sitemap() {
  return {
    name: 'sitemap',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() })
    },
  }
}

// The Quran's text for the ayah search, joined from the page layouts so the repository keeps it once.
function quranText() {
  const readPage = (page) =>
    JSON.parse(readFileSync(new URL(`./public/data/mushaf/${page}.json`, import.meta.url), 'utf8'))
  const source = () => JSON.stringify(quranVerses(readPage))

  return {
    name: 'quran-text',
    configureServer(server) {
      server.middlewares.use(`/${QURAN_TEXT_PATH}`, (request, response) => {
        response.setHeader('Content-Type', 'application/json')
        response.end(source())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: QURAN_TEXT_PATH, source: source() })
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    sitemap(),
    quranText(),
    VitePWA({
      registerType: 'prompt',
      cleanupOutdatedCaches: true,
      devOptions: {
        enabled: false,
      },
      workbox: {
        // The Quran's text is the one data file installed with the app, so ayah search works offline from the start.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}', QURAN_TEXT_PATH],
        // Not precached: screenshots, iOS splash images, and ~48 MB of Mushaf fonts the reader caches itself.
        globIgnores: ['push/onesignal/**/*', 'screenshots/**/*', 'splash/**/*', 'fonts/mushaf/**/*'],
        runtimeCaching: [
          {
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
        // Explicitly undefined: vite-plugin-pwa merges in a default theme_color, which would override the page's meta.
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
