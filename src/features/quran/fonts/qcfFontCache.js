// Lazy loading + offline caching for the QCF V1 per-page mushaf fonts.
// Fonts are stored in the Cache API (shared cache name with the service
// worker's runtime rule) and registered via FontFace so no CSS @font-face
// declarations are needed for 604 files.

export const QCF_CACHE_NAME = 'qcf-v1-fonts'
export const SURAH_NAMES_FONT_FAMILY = 'qcf-surah-names'

const SURAH_NAMES_URL = '/fonts/qcfv1/sura_names.woff2'

export const pageFontUrl = (page) => `/fonts/qcfv1/p${page}.woff2`
export const pageFontFamily = (page) => `qcf-p${page}`

const loading = new Map()

async function getFontBuffer(url) {
  if (!('caches' in window)) {
    // Non-secure context: no persistence, plain fetch.
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Font fetch failed: ${url}`)
    return response.arrayBuffer()
  }

  const cache = await caches.open(QCF_CACHE_NAME)
  const cached = await cache.match(url)
  if (cached) return cached.arrayBuffer()

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Font fetch failed: ${url}`)
  await cache.put(url, response.clone())
  return response.arrayBuffer()
}

async function loadFont(family, url) {
  if (loading.has(family)) return loading.get(family)

  const promise = (async () => {
    const buffer = await getFontBuffer(url)
    const font = new FontFace(family, buffer)
    await font.load()
    document.fonts.add(font)
    return font
  })()

  // Allow retrying after a failure (e.g. offline without cached font).
  promise.catch(() => loading.delete(family))
  loading.set(family, promise)
  return promise
}

export function loadPageFont(page) {
  return loadFont(pageFontFamily(page), pageFontUrl(page))
}

export function loadSurahNamesFont() {
  return loadFont(SURAH_NAMES_FONT_FAMILY, SURAH_NAMES_URL)
}

// Ensures the given pages' fonts are in the offline cache (for downloads).
export async function cachePageFonts(pages, { onProgress } = {}) {
  if (!('caches' in window)) return
  const cache = await caches.open(QCF_CACHE_NAME)
  let done = 0
  for (const page of pages) {
    const url = pageFontUrl(page)
    if (!(await cache.match(url))) {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Font fetch failed: ${url}`)
      await cache.put(url, response)
    }
    onProgress?.(++done, pages.length)
  }
}

export async function arePageFontsCached(pages) {
  if (!('caches' in window)) return false
  const cache = await caches.open(QCF_CACHE_NAME)
  const matches = await Promise.all(pages.map((page) => cache.match(pageFontUrl(page))))
  return matches.every(Boolean)
}

export async function deletePageFonts(pages) {
  if (!('caches' in window)) return
  const cache = await caches.open(QCF_CACHE_NAME)
  await Promise.all(pages.map((page) => cache.delete(pageFontUrl(page))))
}

export async function clearFontCache() {
  if (!('caches' in window)) return
  await caches.delete(QCF_CACHE_NAME)
}
