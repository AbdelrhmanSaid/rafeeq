import './assets/scss/base.scss'
import 'vue-sonner/style.css'

import { createPinia } from 'pinia'
import { ViteSSG } from 'vite-ssg'

import App from './App.vue'
import { routes, installRouterHooks } from './router'
import { useNotificationStore } from './stores/notifications'
import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'
import radios from '@/exports/Radios.js'

const baseRoutes = ['/', '/quran', '/azkar', '/radio', '/sebha', '/zakat', '/settings', '/privacy']
const ssgRoutes = [
  ...baseRoutes,
  ...surahs.map((surah) => `/quran/${surah.id}`),
  ...azkarCategories.flatMap((category) => [`/azkar/${category.id}`, `/azkar/${category.slug}`]),
  ...Object.keys(radios).map((slug) => `/radio/${slug}`),
]

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
  },
  ({ app, router, isClient }) => {
    app.use(createPinia())
    installRouterHooks(router)

    if (isClient) {
      import('bootstrap')
      router.isReady().then(() => {
        // Initialize notifications after app is mounted
        const notificationStore = useNotificationStore()
        notificationStore.initialize()
      })
    }
  },
)

export async function includedRoutes() {
  return Array.from(new Set(ssgRoutes))
}
