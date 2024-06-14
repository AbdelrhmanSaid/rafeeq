import nProgress from 'nprogress'

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/quran',
      name: 'quran',
      component: () => import('@/views/QuranView.vue'),
    },

    {
      path: '/quran/:surah(\\d+)',
      name: 'quran-surah',
      component: () => import('@/views/QuranSurahView.vue'),
    },

    {
      path: '/hisn-al-muslim',
      name: 'hisn-al-muslim',
      component: () => import('@/views/HisnAlMuslimView.vue'),
    },

    {
      path: '/hisn-al-muslim/:category(\\d+)',
      name: 'hisn-al-muslim-category',
      component: () => import('@/views/HisnAlMuslimCategoryView.vue'),
    },

    {
      path: '/radio',
      name: 'radio',
      component: () => import('@/views/RadioView.vue'),
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach(() => {
  nProgress.start()
})

router.afterEach(() => {
  // Close the mobile menu after clicking on a link
  document.querySelector('.navbar-collapse')?.classList?.remove('show')

  // Stop the progress bar
  nProgress.done()

  // Scroll to the top of the page smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

export default router
