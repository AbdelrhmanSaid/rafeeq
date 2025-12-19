import nProgress from 'nprogress'

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { trackPageview } from '@/utilities/analytics'
import { useMeta } from '@/utilities/head'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'الرئيسية',
        description: 'تطبيق رفيق هو رفيقك المسلم، يوفر لك المصحف الكريم، الأذكار، مواقيت الصلاة، وإذاعات القرآن الكريم في مكان واحد.',
        keywords: ['إسلام', 'أذكار', 'قرآن', 'مواقيت الصلاة', 'رفيق', 'تطبيق إسلامي'],
      },
    },

    {
      path: '/quran',
      name: 'quran',
      component: () => import('@/views/QuranView.vue'),
      meta: {
        title: 'القرآن الكريم',
        description: 'تصفح واستمع إلى سور القرآن الكريم كاملة مع مجموعة متنوعة من القراء.',
        keywords: ['القرآن الكريم', 'تلاوة', 'قراء', 'سور', 'استماع'],
      },
    },

    {
      path: '/quran/:surah(\\d+)',
      name: 'quran-surah',
      component: () => import('@/views/QuranSurahView.vue'),
    },

    {
      path: '/azkar',
      name: 'azkar',
      component: () => import('@/views/AzkarView.vue'),
      meta: {
        title: 'الأذكار',
        description: 'مجموعة شاملة من الأذكار اليومية للمسلم: أذكار الصباح والمساء، أذكار النوم، وأدعية من الكتاب والسنة.',
        keywords: ['أذكار', 'أدعية', 'حصن المسلم', 'أذكار الصباح', 'أذكار المساء'],
      },
    },

    {
      path: '/azkar/:category',
      name: 'azkar-category',
      component: () => import('@/views/AzkarCategoryView.vue'),
    },

    {
      path: '/radio',
      name: 'radio',
      component: () => import('@/views/RadioView.vue'),
      meta: {
        title: 'الإذاعة',
        description: 'استمع إلى بث مباشر لمجموعة كبيرة من إذاعات القرآن الكريم والبرامج الإسلامية من مختلف أنحاء العالم.',
        keywords: ['إذاعة القرآن', 'راديو إسلامي', 'بث مباشر', 'تلاوات'],
      },
    },
    {
      path: '/radio/:slug',
      name: 'radio-station',
      component: () => import('@/views/RadioStationView.vue'),
    },

    {
      path: '/sebha',
      name: 'sebha',
      component: () => import('@/views/SebhaView.vue'),
      meta: {
        title: 'السبحة الإلكترونية',
        description: 'سبحة إلكترونية بسيطة وسهلة الاستخدام لمساعدتك في المداومة على ذكر الله في أي وقت.',
        keywords: ['سبحة', 'تسبيح', 'عداد', 'ذكر'],
      },
    },

    {
      path: '/zakat',
      name: 'zakat',
      component: () => import('@/views/ZakatView.vue'),
      meta: {
        title: 'حساب الزكاة',
        description: 'احسب زكاة مالك، الذهب، والفضة بسهولة ودقة وفقاً للضوابط الشرعية.',
        keywords: ['زكاة', 'حساب الزكاة', 'صدقة', 'نصاب'],
      },
    },

    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/SettingsView.vue'),
      meta: {
        title: 'الإعدادات',
        description: 'تخصيص إعدادات تطبيق رفيق بما يناسب احتياجاتك وتفضيلاتك.',
        keywords: ['إعدادات', 'تخصيص', 'خيارات'],
      },
    },

    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyPolicyView.vue'),
      meta: {
        title: 'سياسة الخصوصية',
        description: 'تعرف على كيفية حماية تطبيق رفيق لبياناتك وخصوصيتك.',
        keywords: ['خصوصية', 'بيانات', 'أمان'],
      },
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: {
        title: '404 - الصفحة غير موجودة',
        description: 'عذراً، الصفحة التي تبحث عنها غير موجودة.',
        keywords: ['404', 'صفحة غير موجودة'],
      },
    },
  ],
})

router.beforeEach(() => {
  nProgress.start()
})

router.afterEach((to) => {
  // Close the mobile menu after clicking on a link
  document.querySelector('.navbar-collapse')?.classList?.remove('show')

  // Stop the progress bar
  nProgress.done()

  // Scroll to the top of the page smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Update the meta tags
  useMeta(to.meta)

  // Send a pageview to analytics without blocking navigation
  trackPageview(to.fullPath)
})

export default router
