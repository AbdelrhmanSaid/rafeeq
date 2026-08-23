// Every in-app URL in one place: paths for static pages, builders for the ones
// that take a parameter. Components link through these instead of hardcoding.
export const ROUTES = {
  home: '/',
  quran: '/quran',
  quranSurah: (surah) => `/quran/${surah}`,
  azkar: '/azkar',
  azkarCategory: (category) => `/azkar/${category}`,
  radio: '/radio',
  radioStation: (slug) => `/radio/${slug}`,
  sebha: '/sebha',
  qibla: '/qibla',
  zakat: '/zakat',
  settings: '/settings',
  settingsTab: (tab) => `/settings/${tab}`,
  privacy: '/privacy',
  embedComponent: (component) => `/embed/components/${component}`,
}

export const EMBED_PREFIX = '/embed'

export const isEmbedPath = (pathname) => pathname.startsWith(EMBED_PREFIX)
