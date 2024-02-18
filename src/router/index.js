import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/radio',
      name: 'radio',
      component: () => import('@/pages/RadioPage.vue')
    },
    {
      path: '/quran',
      name: 'quran',
      component: () => import('@/pages/QuranPage.vue')
    },
    {
      path: '/quran/:surah',
      name: 'quran-surah',
      component: () => import('@/pages/QuranSurahPage.vue')
    },
  ]
})

export default router
