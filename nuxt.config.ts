// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Enable SSR
  ssr: true,

  // App configuration
  app: {
    head: {
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
      title: 'رفيق - زادك في الطريق',
      meta: [
        { name: 'theme-color', content: '#795547' },
        { name: 'description', content: 'تطبيق إسلامي شامل للأذكار والقرآن الكريم ومواقيت الصلاة' },
        { name: 'keywords', content: 'إسلام, أذكار, قرآن, مواقيت الصلاة, رفيق, تطبيق إسلامي, Azkar, Quran, Prayer Times, Islamic App, Muslim, أوقات الصلاة, دعاء, تسبيح' },
        { name: 'author', content: 'رفيق' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'application-name', content: 'رفيق' },
        { name: 'msapplication-TileColor', content: '#795547' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
      ],
    },
  },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
  ],

  // CSS
  css: [
    '~/assets/scss/base.scss',
  ],

  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },

  // PostCSS configuration for RTL support
  postcss: {
    plugins: {
      rtlcss: {},
    },
  },

  // PWA configuration
  pwa: {
    registerType: 'autoUpdate',
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
        { src: '/icons/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/android/android-launchericon-144-144.png', sizes: '144x144', type: 'image/png' },
        { src: '/icons/android/android-launchericon-96-96.png', sizes: '96x96', type: 'image/png' },
        { src: '/icons/android/android-launchericon-72-72.png', sizes: '72x72', type: 'image/png' },
        { src: '/icons/android/android-launchericon-48-48.png', sizes: '48x48', type: 'image/png' },
        { src: '/icons/ios/180.png', sizes: '180x180', type: 'image/png' },
        { src: '/icons/ios/152.png', sizes: '152x152', type: 'image/png' },
        { src: '/icons/ios/120.png', sizes: '120x120', type: 'image/png' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^.*\/data\/azkar\/.*\.json$/,
          handler: 'CacheFirst',
          options: { cacheName: 'azkar-cache' },
        },
        {
          urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*/,
          handler: 'CacheFirst',
          options: { cacheName: 'quran-api-cache' },
        },
        {
          urlPattern: /^https:\/\/api\.aladhan\.com\/v1\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'prayer-times-cache',
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 12 },
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: /^.*\.(ttf|woff|woff2)$/,
          handler: 'CacheFirst',
          options: { cacheName: 'fonts-cache' },
        },
        {
          urlPattern: /^.*\.(png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: { cacheName: 'images-cache' },
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
  },

  // Nitro configuration for SSR
  nitro: {
    preset: 'node-server',
  },

  // Route rules for SSR/SSG hybrid
  routeRules: {
    '/': { prerender: true },
    '/quran': { prerender: true },
    '/azkar': { prerender: true },
    '/radio': { prerender: true },
    '/sebha': { prerender: true },
    '/zakat': { prerender: true },
    '/settings': { ssr: false },
    '/privacy': { prerender: true },
  },
})

