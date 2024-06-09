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
      path: '/hadith',
      name: 'hadith',
      component: () => import('@/views/HadithView.vue'),
    },

    {
      path: '/hisn-al-muslim',
      name: 'hisn-al-muslim',
      component: () => import('@/views/HisnAlMuslimView.vue'),
    },

    {
      path: '/radio',
      name: 'radio',
      component: () => import('@/views/RadioView.vue'),
    },

    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },

    {
      path: '/:pathMatch(.*)*',
      component: NotFoundView,
    },
  ],
})

router.afterEach(() => {
  // Close the mobile menu after clicking on a link
  document.querySelector('.navbar-collapse')?.classList?.remove('show')
})

export default router
