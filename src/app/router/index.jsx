import { createBrowserRouter } from 'react-router-dom'

import App from '@/app/App'
import HomeView from '@/features/home/views/HomeView'
import NotFoundView from '@/app/views/NotFoundView'
import { EMBED_PREFIX, ROUTES } from '@/app/router/routes'

// `lazy` keeps each view out of the initial bundle; React Router loads it the
// first time its route is visited.
const lazyView = (loader) => async () => ({ Component: (await loader()).default })

const pages = [
  {
    path: ROUTES.home,
    element: <HomeView />,
    meta: {
      title: 'الرئيسية',
      description:
        'تطبيق رفيق هو رفيقك المسلم، يوفر لك المصحف الكريم، الأذكار، مواقيت الصلاة، وإذاعات القرآن الكريم في مكان واحد.',
      keywords: ['إسلام', 'أذكار', 'قرآن', 'مواقيت الصلاة', 'رفيق', 'تطبيق إسلامي'],
    },
  },

  {
    path: ROUTES.quran,
    lazy: lazyView(() => import('@/features/quran/views/QuranView')),
    meta: {
      title: 'القرآن الكريم',
      description: 'تصفح واستمع إلى سور القرآن الكريم كاملة مع مجموعة متنوعة من القراء.',
      keywords: ['القرآن الكريم', 'تلاوة', 'قراء', 'سور', 'استماع'],
    },
  },

  {
    path: ROUTES.quranSurah(':surah'),
    lazy: lazyView(() => import('@/features/quran/views/QuranSurahView')),
  },

  {
    path: ROUTES.azkar,
    lazy: lazyView(() => import('@/features/azkar/views/AzkarView')),
    meta: {
      title: 'الأذكار',
      description:
        'مجموعة شاملة من الأذكار اليومية للمسلم: أذكار الصباح والمساء، أذكار النوم، وأدعية من الكتاب والسنة.',
      keywords: ['أذكار', 'أدعية', 'حصن المسلم', 'أذكار الصباح', 'أذكار المساء'],
    },
  },

  {
    path: ROUTES.azkarCategory(':category'),
    lazy: lazyView(() => import('@/features/azkar/views/AzkarCategoryView')),
  },

  {
    path: ROUTES.radio,
    lazy: lazyView(() => import('@/features/radio/views/RadioView')),
    meta: {
      title: 'الإذاعة',
      description: 'استمع إلى بث مباشر لمجموعة كبيرة من إذاعات القرآن الكريم والبرامج الإسلامية من مختلف أنحاء العالم.',
      keywords: ['إذاعة القرآن', 'راديو إسلامي', 'بث مباشر', 'تلاوات'],
    },
  },

  {
    path: ROUTES.radioStation(':slug'),
    lazy: lazyView(() => import('@/features/radio/views/RadioStationView')),
  },

  {
    path: ROUTES.sebha,
    lazy: lazyView(() => import('@/features/sebha/views/SebhaView')),
    meta: {
      title: 'السبحة الإلكترونية',
      description: 'سبحة إلكترونية بسيطة وسهلة الاستخدام لمساعدتك في المداومة على ذكر الله في أي وقت.',
      keywords: ['سبحة', 'تسبيح', 'عداد', 'ذكر'],
    },
  },

  {
    path: ROUTES.qibla,
    lazy: lazyView(() => import('@/features/qibla/views/QiblaView')),
    meta: {
      title: 'اتجاه القبلة',
      description: 'حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية ومعرفة الاتجاه الصحيح للصلاة.',
      keywords: ['قبلة', 'اتجاه القبلة', 'بوصلة', 'صلاة', 'مكة'],
    },
  },

  {
    path: ROUTES.zakat,
    lazy: lazyView(() => import('@/features/zakat/views/ZakatView')),
    meta: {
      title: 'حساب الزكاة',
      description: 'احسب زكاة مالك، الذهب، والفضة بسهولة ودقة وفقاً للضوابط الشرعية.',
      keywords: ['زكاة', 'حساب الزكاة', 'صدقة', 'نصاب'],
    },
  },

  {
    path: ROUTES.settingsTab(':tab?'),
    lazy: lazyView(() => import('@/features/settings/views/SettingsView')),
    meta: {
      title: 'الإعدادات',
      description: 'تخصيص إعدادات تطبيق رفيق بما يناسب احتياجاتك وتفضيلاتك.',
      keywords: ['إعدادات', 'تخصيص', 'خيارات'],
    },
  },

  {
    path: ROUTES.privacy,
    lazy: lazyView(() => import('@/app/views/PrivacyPolicyView')),
    meta: {
      title: 'سياسة الخصوصية',
      description: 'تعرف على كيفية حماية تطبيق رفيق لبياناتك وخصوصيتك.',
      keywords: ['خصوصية', 'بيانات', 'أمان'],
    },
  },

  {
    noEmbed: true,
    path: ROUTES.embedComponent(':component'),
    lazy: lazyView(() => import('@/features/embed/views/EmbedComponentView')),
  },
]

const notFound = {
  path: '*',
  element: <NotFoundView />,
  meta: {
    title: '٤٠٤ - الصفحة غير موجودة',
    description: 'عذراً، الصفحة التي تبحث عنها غير موجودة.',
    keywords: ['٤٠٤', 'صفحة غير موجودة'],
  },
}

// Route meta travels on `handle` so the app shell can read it with useMatches().
function toRoute({ meta, noEmbed, ...route }) {
  return meta ? { ...route, handle: { meta } } : route
}

// Every page is also reachable under /embed, which renders it without the app
// chrome so it can be dropped into an iframe.
function withEmbedAliases(routes) {
  return routes.flatMap((route) => {
    const base = toRoute(route)
    if (route.noEmbed) return [base]

    return [base, { ...base, path: `${EMBED_PREFIX}${route.path}` }]
  })
}

// Exported on its own so tests can mount the same tree in a memory router.
export const routes = [
  {
    element: <App />,
    children: [...withEmbedAliases(pages), toRoute(notFound)],
  },
]

export const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })
