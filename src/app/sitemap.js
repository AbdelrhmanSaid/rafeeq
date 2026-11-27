import azkarCategories from '../features/azkar/data/categories.js'
import radios from '../features/radio/data/radios.js'
import { PAGE_STARTS } from '../features/quran/data/mushaf-index.js'

const BASE_URL = 'https://rafeeq.me'

// Checked against the router by sitemap.spec.js, so a new screen can't be left out.
export const STATIC_ROUTES = [
  '/',
  '/quran',
  '/azkar',
  '/radio',
  '/qibla',
  '/sebha',
  '/zakat',
  '/settings',
  '/more',
  '/privacy',
]

export function sitemapPaths() {
  return [
    ...STATIC_ROUTES,
    ...PAGE_STARTS.map((_, index) => `/quran/page/${index + 1}`),
    ...azkarCategories.map((category) => `/azkar/${category.slug}`),
    ...Object.keys(radios).map((slug) => `/radio/${slug}`),
  ]
}

export function sitemapXml() {
  const urls = sitemapPaths().map(
    (path) => `  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}
