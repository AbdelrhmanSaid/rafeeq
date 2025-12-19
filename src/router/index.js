import nProgress from 'nprogress'

import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { trackPageview } from '@/utilities/analytics'

const siteOrigin = 'https://rafeeq.me'
const defaultTitle = 'رفيق - زادك في الطريق'
const defaultDescription = 'تطبيق إسلامي شامل للأذكار والقرآن الكريم ومواقيت الصلاة'
const defaultKeywords =
  'إسلام, أذكار, قرآن, مواقيت الصلاة, رفيق, تطبيق إسلامي, Azkar, Quran, Prayer Times, Islamic App, Muslim, أوقات الصلاة, دعاء, تسبيح'

const setMetaTag = ({ name, property, content }) => {
  const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    if (property) {
      element.setAttribute('property', property)
    } else if (name) {
      element.setAttribute('name', name)
    }
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

const setCanonicalLink = (url) => {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

const resolveMeta = (to) => {
  const title = to.meta?.title || defaultTitle
  const description = to.meta?.description || defaultDescription
  const keywords = to.meta?.keywords || defaultKeywords
  const canonicalUrl = `${siteOrigin}${to.path}`

  return { title, description, keywords, canonicalUrl }
}

export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'رفيق - زادك في الطريق',
      description: 'تطبيق إسلامي شامل للأذكار والقرآن الكريم ومواقيت الصلاة.',
    },
  },

  {
    path: '/quran',
    name: 'quran',
    component: () => import('@/views/QuranView.vue'),
    meta: {
      title: 'القرآن الكريم | رفيق',
      description: 'استمع واقرأ القرآن الكريم مع معلومات السور والتلاوات المختلفة.',
    },
  },

  {
    path: '/quran/:surah(\\d+)',
    name: 'quran-surah',
    component: () => import('@/views/QuranSurahView.vue'),
    meta: {
      title: 'سورة من القرآن الكريم | رفيق',
      description: 'عرض السورة بالتلاوة والنص مع تفاصيل عدد الآيات ونوع السورة.',
    },
  },

  {
    path: '/azkar',
    name: 'azkar',
    component: () => import('@/views/AzkarView.vue'),
    meta: {
      title: 'الأذكار | رفيق',
      description: 'تصفح أبواب الأذكار اليومية والصباحية والمسائية والرقية الشرعية.',
    },
  },

  {
    path: '/azkar/:category',
    name: 'azkar-category',
    component: () => import('@/views/AzkarCategoryView.vue'),
    meta: {
      title: 'أذكار مختارة | رفيق',
      description: 'عرض أذكار القسم المحدد مع النصوص الكاملة وفوائد الذكر.',
    },
  },

  {
    path: '/radio',
    name: 'radio',
    component: () => import('@/views/RadioView.vue'),
    meta: {
      title: 'إذاعات القرآن الكريم | رفيق',
      description: 'استمع إلى إذاعات القرآن الكريم من مختلف أنحاء العالم.',
    },
  },
  {
    path: '/radio/:slug',
    name: 'radio-station',
    component: () => import('@/views/RadioStationView.vue'),
    meta: {
      title: 'إذاعة القرآن الكريم | رفيق',
      description: 'استمع إلى إذاعة القرآن الكريم المفضلة لديك بجودة عالية.',
    },
  },

  {
    path: '/sebha',
    name: 'sebha',
    component: () => import('@/views/SebhaView.vue'),
    meta: {
      title: 'السبحة الإلكترونية | رفيق',
      description: 'سبحة إلكترونية تساعدك على الذكر والتسبيح بسهولة.',
    },
  },

  {
    path: '/zakat',
    name: 'zakat',
    component: () => import('@/views/ZakatView.vue'),
    meta: {
      title: 'حاسبة الزكاة | رفيق',
      description: 'احسب الزكاة للمال والذهب والفضة والتجارة بسهولة ودقة.',
    },
  },

  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: {
      title: 'الإعدادات | رفيق',
      description: 'تعديل الإعدادات المختلفة للتطبيق وإدارة التنبيهات والتنزيلات.',
    },
  },

  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyPolicyView.vue'),
    meta: {
      title: 'سياسة الخصوصية | رفيق',
      description: 'تعرف على سياسة الخصوصية وكيفية تعاملنا مع البيانات.',
    },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'الصفحة غير موجودة | رفيق',
      description: 'الصفحة التي تبحث عنها غير متاحة حاليًا.',
    },
  },
]

export const installRouterHooks = (router) => {
  const isClient = !import.meta.env.SSR

  if (!isClient) return

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

    // Send a pageview to analytics without blocking navigation
    trackPageview(to.fullPath)

    const { title, description, keywords, canonicalUrl } = resolveMeta(to)

    document.title = title
    setMetaTag({ name: 'description', content: description })
    setMetaTag({ name: 'keywords', content: keywords })
    setMetaTag({ property: 'og:title', content: title })
    setMetaTag({ property: 'og:description', content: description })
    setMetaTag({ property: 'og:url', content: canonicalUrl })
    setMetaTag({ name: 'twitter:title', content: title })
    setMetaTag({ name: 'twitter:description', content: description })
    setCanonicalLink(canonicalUrl)
  })
}
