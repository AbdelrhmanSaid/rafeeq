import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/features/home/views/HomeView.vue'
import NotFoundView from '@/app/views/NotFoundView.vue'
import { trackPageview } from '@/app/analytics'
import { useMeta } from '@/shared/utils/head'
import { useThemeStore } from '@/app/stores/theme'
import { isVerse, pageOfAyah, verseKey } from '@/features/quran/lib/mushaf'
import { SETTINGS_SECTION_LABELS } from '@/features/settings/lib/sections'

function withEmbedAliases(routes) {
  return routes.map((route) =>
    route.noEmbed ? route : { ...route, alias: [...(route.alias || []), `/embed${route.path}`] },
  )
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.name === from.name && (to.meta.paramTabs || to.meta.pageParam)) return
    // 'instant' overrides Bootstrap's smooth scrolling, which flashed the app bar's title and glass on the way up.
    return { top: 0, behavior: 'instant' }
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
      path: '/quran/page/:page(\\d+)',
      name: 'quran-page',
      component: () => import('@/features/quran/views/QuranReaderView.vue'),
      meta: { parent: 'quran', pageParam: true },
    },

    // Old public links: a surah, or an ayah with ?ayah=, opens on its Mushaf page.
    {
      path: '/quran/:surah(\\d+)',
      name: 'quran-surah',
      // By path, so an embedded link stays embedded and keeps its theme query.
      redirect: ({ path, params, query }) => {
        const base = path.startsWith('/embed') ? '/embed' : ''
        const surah = Number(params.surah)
        const ayah = Number(query.ayah) || 1
        if (!isVerse(surah, ayah)) return { path: `${base}/quran`, query: {} }
        return {
          path: `${base}/quran/page/${pageOfAyah(surah, ayah)}`,
          query: { ...query, ayah: query.ayah ? verseKey(surah, ayah) : undefined },
        }
      },
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
      meta: { parent: 'azkar' },
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
      meta: { parent: 'radio' },
    },

    {
      path: '/sebha',
      name: 'sebha',
      component: () => import('@/features/sebha/views/SebhaView.vue'),
      meta: {
        parent: 'more',
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
        parent: 'more',
        title: 'اتجاه القبلة',
        description: 'حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية ومعرفة الاتجاه الصحيح للصلاة.',
        keywords: ['قبلة', 'اتجاه القبلة', 'بوصلة', 'صلاة', 'مكة'],
      },
    },

    {
      path: '/zakat/:tab(money|gold|silver|livestock|crops|business)?',
      name: 'zakat',
      component: () => import('@/features/zakat/views/ZakatView.vue'),
      meta: {
        parent: 'more',
        paramTabs: true,
        title: 'حساب الزكاة',
        description: 'احسب زكاة مالك، الذهب، والفضة بسهولة ودقة وفقاً للضوابط الشرعية.',
        keywords: ['زكاة', 'حساب الزكاة', 'صدقة', 'نصاب'],
      },
    },

    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/features/settings/views/SettingsView.vue'),
      meta: {
        parent: 'more',
        title: 'الإعدادات',
        description: 'تخصيص إعدادات تطبيق رفيق بما يناسب احتياجاتك وتفضيلاتك.',
        keywords: ['إعدادات', 'تخصيص', 'خيارات'],
      },
    },

    {
      path: `/settings/:tab(${Object.keys(SETTINGS_SECTION_LABELS).join('|')})`,
      name: 'settings-section',
      component: () => import('@/features/settings/views/SettingsView.vue'),
      meta: {
        parent: 'settings',
        title: (to) => `${SETTINGS_SECTION_LABELS[to.params.tab]} - الإعدادات`,
        description: 'تخصيص إعدادات تطبيق رفيق بما يناسب احتياجاتك وتفضيلاتك.',
        keywords: ['إعدادات', 'تخصيص', 'خيارات'],
      },
    },

    {
      noEmbed: true,
      path: '/more',
      name: 'more',
      component: () => import('@/features/more/views/MoreView.vue'),
      meta: {
        title: 'المزيد',
        description: 'أدوات رفيق الإضافية، الإعدادات، وروابط التواصل والدعم.',
        keywords: ['رفيق', 'المزيد', 'أدوات'],
      },
    },

    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/app/views/PrivacyPolicyView.vue'),
      meta: {
        parent: 'more',
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
      meta: {
        title: (to) => (typeof to.query.title === 'string' ? to.query.title.trim() : undefined),
      },
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

router.afterEach((to, from) => {
  const themeStore = useThemeStore()
  if (to.path.startsWith('/embed')) {
    themeStore.applyQueryOverrides(to.query)
  } else {
    themeStore.clearQueryOverrides()
  }

  if (to.meta.pageParam && from.name === to.name) return

  const { title } = to.meta
  useMeta({ ...to.meta, title: typeof title === 'function' ? title(to) : title })

  trackPageview(to.fullPath)
})

export default router
