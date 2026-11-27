import { computed, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import surahs from '@/features/quran/data/surahs.js'
import { pageDataUrl, pageFontUrl, surahPages } from '@/features/quran/lib/mushaf'

// Layout and font share one cache so a stored page always opens offline; rename it only if the files change.
const CACHE_NAME = 'mushaf-v2'
// Migration for existing users: mushaf-v1 held V2 fonts and layouts that don't match V4, so it's deleted on start.
const OLD_CACHES = ['mushaf-v1']

const hasCacheStorage = () => typeof caches !== 'undefined'
const openCache = () => (hasCacheStorage() ? caches.open(CACHE_NAME).catch(() => null) : Promise.resolve(null))

export const storedPages = reactive(new Set())

let scanned = null

export function scanStoredPages() {
  scanned ??= (async () => {
    if (hasCacheStorage()) await Promise.all(OLD_CACHES.map((name) => caches.delete(name).catch(() => {})))
    const cache = await openCache()
    if (!cache) return
    const urls = new Set((await cache.keys()).map((request) => request.url))
    const absolute = (url) => new URL(url, location.origin).href
    for (let page = 1; page <= 604; page++) {
      if (urls.has(absolute(pageDataUrl(page))) && urls.has(absolute(pageFontUrl(page)))) storedPages.add(page)
    }
    recordReadSurahs(storedPages)
  })()
  return scanned
}

// Validated before caching so a captive portal's page or a cut-off download is never stored for good.
const checkLayout = (buffer) => {
  const data = JSON.parse(new TextDecoder().decode(buffer))
  if (!Array.isArray(data?.lines) || typeof data.verses !== 'object') throw new Error('Not a Mushaf page')
  return data
}

const checkFont = (buffer) => {
  if (new TextDecoder().decode(buffer.slice(0, 4)) !== 'wOF2') throw new Error('Not a WOFF2 font')
  return buffer
}

// `saved`: a full disk only costs the offline copy, but the page then mustn't count as downloaded.
async function fetchStored(url, check, signal) {
  const cache = await openCache()
  const stored = await cache?.match(url)
  if (stored) {
    try {
      return { value: check(await stored.arrayBuffer()), saved: true }
    } catch {
      await cache.delete(url)
    }
  }

  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const buffer = await response.arrayBuffer()
  const value = check(buffer)
  signal?.throwIfAborted()
  const saved = cache
    ? await cache.put(url, new Response(buffer, { headers: response.headers })).then(
        () => true,
        () => false,
      )
    : false
  return { value, saved }
}

const fetchLayout = (page, signal) => fetchStored(pageDataUrl(page), checkLayout, signal)
const fetchFont = (page, signal) => fetchStored(pageFontUrl(page), checkFont, signal)

const fontFamily = (page) => `mushaf-p${page}`

const loaded = new Map()

export function loadPage(page) {
  if (!loaded.has(page)) {
    const entry = { dropped: false, face: null }
    entry.promise = (async () => {
      const [data, font] = await Promise.all([fetchLayout(page), fetchFont(page)])
      const face = new FontFace(fontFamily(page), font.value)
      try {
        await face.load()
      } catch (error) {
        const cache = await openCache()
        await cache?.delete(pageFontUrl(page))
        throw error
      }
      if (data.saved && font.saved) {
        storedPages.add(page)
        recordReadSurahs([page])
      }
      if (!entry.dropped) {
        entry.face = face
        document.fonts.add(face)
      }
      return { data: data.value, fontFamily: fontFamily(page) }
    })()
    entry.promise.catch(() => loaded.get(page) === entry && loaded.delete(page))
    loaded.set(page, entry)
  }
  return loaded.get(page).promise
}

// Fonts are about 80 KB each, so only pages near the reader stay registered.
export function keepPagesNear(page, distance = 4) {
  for (const [other, entry] of loaded) {
    if (Math.abs(other - page) <= distance) continue
    entry.dropped = true
    if (entry.face) document.fonts.delete(entry.face)
    loaded.delete(other)
  }
}

// Pages stored by an unfinished surah download (taken back on cancel); never pages kept from reading.
const unfinished = new Set()

async function downloadPages(pages, signal) {
  for (const page of pages) {
    signal?.throwIfAborted()
    if (storedPages.has(page)) continue
    // Marked before fetching so a page with only one file stored is taken back too.
    unfinished.add(page)
    // allSettled: an abort mustn't leave one file still writing after the page is taken back.
    const results = await Promise.allSettled([fetchLayout(page, signal), fetchFont(page, signal)])
    const failed = results.find((result) => result.status === 'rejected')
    if (failed) throw failed.reason
    if (!results.every((result) => result.value.saved)) throw new Error(`Could not store page ${page}`)
    storedPages.add(page)
  }
}

async function removePages(pages) {
  const cache = await openCache()
  for (const page of pages) {
    await cache?.delete(pageDataUrl(page))
    await cache?.delete(pageFontUrl(page))
    storedPages.delete(page)
  }
}

// Kept out of settings backups: it describes this device's storage.
const downloaded = useLocalStorage('mushaf-downloaded-surahs', [])
const downloadedSet = computed(() => new Set(downloaded.value))

let surahsByPage = null
function surahsOnPage(page) {
  if (!surahsByPage) {
    surahsByPage = new Map()
    for (const { id } of surahs) {
      for (const p of surahPages(id)) surahsByPage.set(p, [...(surahsByPage.get(p) ?? []), id])
    }
  }
  return surahsByPage.get(page) ?? []
}

function recordReadSurahs(pages) {
  const complete = new Set()
  for (const page of pages) {
    for (const surah of surahsOnPage(page)) {
      if (!downloadedSet.value.has(surah) && surahPages(surah).every((p) => storedPages.has(p))) complete.add(surah)
    }
  }
  if (complete.size) downloaded.value = [...downloaded.value, ...complete]
}

const isSurahDownloaded = (surah) =>
  downloadedSet.value.has(surah) && surahPages(surah).every((page) => storedPages.has(page))

export const hasMushafDownloads = () => downloaded.value.length > 0

export const mushafDownloads = {
  missing: () => downloaded.value.filter((surah) => !isSurahDownloaded(surah)),
  downloadedCount: computed(() => surahs.filter((s) => isSurahDownloaded(s.id)).length),
  isDownloaded: (key) => isSurahDownloaded(Number(key)),
  async download(key, { signal } = {}) {
    const surah = Number(key)
    const pages = surahPages(surah)
    await downloadPages(pages, signal)
    signal?.throwIfAborted()
    if (!downloadedSet.value.has(surah)) downloaded.value = [...downloaded.value, surah]
    for (const page of pages) unfinished.delete(page)
  },
  async discard(key) {
    const pages = surahPages(Number(key)).filter((page) => unfinished.has(page))
    const kept = new Set(downloaded.value.flatMap((id) => surahPages(id)))
    for (const page of pages) unfinished.delete(page)
    await removePages(pages.filter((page) => !kept.has(page)))
  },
  async remove(key) {
    const surah = Number(key)
    downloaded.value = downloaded.value.filter((id) => id !== surah)
    const kept = new Set(downloaded.value.flatMap((id) => surahPages(id)))
    await removePages(surahPages(surah).filter((page) => !kept.has(page)))
  },
  async removeAll() {
    downloaded.value = []
    unfinished.clear()
    if (hasCacheStorage()) await caches.delete(CACHE_NAME)
    storedPages.clear()
  },
}
