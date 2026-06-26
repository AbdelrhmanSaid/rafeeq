import nProgress from 'nprogress'

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/home/views/HomeView.vue'
import NotFoundView from '@/app/views/NotFoundView.vue'
import { trackPageview } from '@/shared/utils/analytics'
import { useMeta } from '@/shared/utils/head'
import { useThemeStore } from '@/app/stores/theme'

function withEmbedAliases(routes) {
  return routes.map((route) =>
    route.noEmbed ? route : { ...route, alias: [...(route.alias || []), `/embed${route.path}`] },
  )
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Owns scrolling so a cancelled leave-guard on browser back no longer yanks
  // the page to the top (also switches the browser to manual restoration).
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: withEmbedAliases([
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'الرئيسية',
        description:
          'تطبيق رفيق هو رفيقك المسلم، يوفر لك المصحف الكريم، الأذكار، مواقيت الصلاة، وإذاعات القرآن الكريم في مكان واحد.',
        keywords: ['إسلام', 'أذكار', 'قرآن', 'مواقيت الصلاة', 'رفيق', 'تطبيق إسلامي'],
      },
    },

    {
      path: '/quran',
      name: 'quran',
      component: () => import('@/features/quran/views/QuranView.vue'),
      meta: {
        title: 'القرآن الكريم',
        description: 'تصفح واستمع إلى سور القرآن الكريم كاملة مع مجموعة متنوعة من القراء.',
        keywords: ['القرآن الكريم', 'تلاوة', 'قراء', 'سور', 'استماع'],
      },
    },

    {
      path: '/quran/:surah(\\d+)',
      name: 'quran-surah',
      component: () => import('@/features/quran/views/QuranSurahView.vue'),
    },

    {
      path: '/azkar',
      name: 'azkar',
      component: () => import('@/features/azkar/views/AzkarView.vue'),
      meta: {
        title: 'الأذكار',
        description:
          'مجموعة شاملة من الأذكار اليومية للمسلم: أذكار الصباح والمساء، أذكار النوم، وأدعية من الكتاب والسنة.',
        keywords: ['أذكار', 'أدعية', 'حصن المسلم', 'أذكار الصباح', 'أذكار المساء'],
      },
    },

    {
      path: '/azkar/:category',
      name: 'azkar-category',
      component: () => import('@/features/azkar/views/AzkarCategoryView.vue'),
    },

    {
      path: '/radio',
      name: 'radio',
      component: () => import('@/features/radio/views/RadioView.vue'),
      meta: {
        title: 'الإذاعة',
        description:
          'استمع إلى بث مباشر لمجموعة كبيرة من إذاعات القرآن الكريم والبرامج الإسلامية من مختلف أنحاء العالم.',
        keywords: ['إذاعة القرآن', 'راديو إسلامي', 'بث مباشر', 'تلاوات'],
      },
    },

    {
      path: '/radio/:slug',
      name: 'radio-station',
      component: () => import('@/features/radio/views/RadioStationView.vue'),
    },

    {
      path: '/sebha',
      name: 'sebha',
      component: () => import('@/features/sebha/views/SebhaView.vue'),
      meta: {
        title: 'السبحة الإلكترونية',
        description: 'سبحة إلكترونية بسيطة وسهلة الاستخدام لمساعدتك في المداومة على ذكر الله في أي وقت.',
        keywords: ['سبحة', 'تسبيح', 'عداد', 'ذكر'],
      },
    },

    {
      path: '/qibla',
      name: 'qibla',
      component: () => import('@/features/qibla/views/QiblaView.vue'),
      meta: {
        title: 'اتجاه القبلة',
        description: 'حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية ومعرفة الاتجاه الصحيح للصلاة.',
        keywords: ['قبلة', 'اتجاه القبلة', 'بوصلة', 'صلاة', 'مكة'],
      },
    },

    {
      path: '/zakat',
      name: 'zakat',
      component: () => import('@/features/zakat/views/ZakatView.vue'),
      meta: {
        title: 'حساب الزكاة',
        description: 'احسب زكاة مالك، الذهب، والفضة بسهولة ودقة وفقاً للضوابط الشرعية.',
        keywords: ['زكاة', 'حساب الزكاة', 'صدقة', 'نصاب'],
      },
    },

    {
      path: '/settings/:tab(appearance|prayer|quran|azkar|app|downloads)?',
      name: 'settings',
      component: () => import('@/features/settings/views/SettingsView.vue'),
      meta: {
        title: 'الإعدادات',
        description: 'تخصيص إعدادات تطبيق رفيق بما يناسب احتياجاتك وتفضيلاتك.',
        keywords: ['إعدادات', 'تخصيص', 'خيارات'],
      },
    },

    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/app/views/PrivacyPolicyView.vue'),
      meta: {
        title: 'سياسة الخصوصية',
        description: 'تعرف على كيفية حماية تطبيق رفيق لبياناتك وخصوصيتك.',
        keywords: ['خصوصية', 'بيانات', 'أمان'],
      },
    },

    {
      noEmbed: true,
      path: '/embed/components/:component',
      name: 'embed-component',
      component: () => import('@/features/embed/views/EmbedComponentView.vue'),
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: {
        title: '٤٠٤ - الصفحة غير موجودة',
        description: 'عذراً، الصفحة التي تبحث عنها غير موجودة.',
        keywords: ['٤٠٤', 'صفحة غير موجودة'],
      },
    },
  ]),
})

router.beforeEach((to) => {
  // If the page is not an embed page, show the progress bar
  if (!to.path.startsWith('/embed')) {
    nProgress.start()
  }
})

router.afterEach((to) => {
  useThemeStore().applyQueryOverrides(to.query)

  // Close the mobile menu after clicking on a link
  document.querySelector('.navbar-collapse')?.classList?.remove('show')

  // Stop the progress bar
  nProgress.done()

  // Update the meta tags
  useMeta(to.meta)

  // Send a pageview to analytics without blocking navigation
  trackPageview(to.fullPath)
})

export default router
