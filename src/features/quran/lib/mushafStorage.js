import { computed, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import surahs from '@/features/quran/data/surahs.js'
import { pageDataUrl, pageFontUrl, surahPages } from '@/features/quran/lib/mushaf'

// Every page read or downloaded stays on the device: its layout and its font, kept together in one cache so a stored
// page always opens offline. The cache name changes only if the files themselves ever change.
const CACHE_NAME = 'mushaf-v2'
// Earlier caches, deleted on start. mushaf-v1 held the V2 fonts and their layouts, which don't match the V4 ones.
const OLD_CACHES = ['mushaf-v1']

const hasCacheStorage = () => typeof caches !== 'undefined'
const openCache = () => (hasCacheStorage() ? caches.open(CACHE_NAME).catch(() => null) : Promise.resolve(null))

// Pages with both files stored.
export const storedPages = reactive(new Set())

let scanned = null

// Read once what earlier sessions stored, so the downloads list shows it.
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
  })()
  return scanned
}

// Files are checked before they're kept, so a broken response (a captive portal's page, a cut-off download) is never
// stored and retried forever: a page's layout must parse, and a font must be a WOFF2 file.
const checkLayout = (buffer) => {
  const data = JSON.parse(new TextDecoder().decode(buffer))
  if (!Array.isArray(data?.lines) || typeof data.verses !== 'object') throw new Error('Not a Mushaf page')
  return data
}

const checkFont = (buffer) => {
  if (new TextDecoder().decode(buffer.slice(0, 4)) !== 'wOF2') throw new Error('Not a WOFF2 font')
  return buffer
}

// A file from the device if it's there and sound, else from the network, kept for next time. `saved` says whether
// it's on the device now: a full disk only costs the offline copy, but then the page mustn't count as downloaded.
// An aborted download stops fetching and stores nothing more.
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

// Pages in memory, each with its layout and its registered font.
const loaded = new Map()

// A page ready to draw: its layout and the name of its loaded font.
export function loadPage(page) {
  if (!loaded.has(page)) {
    const entry = { dropped: false, face: null }
    entry.promise = (async () => {
      const [data, font] = await Promise.all([fetchLayout(page), fetchFont(page)])
      const face = new FontFace(fontFamily(page), font.value)
      try {
        await face.load()
      } catch (error) {
        // A font the browser can't read is dropped, so the next try fetches it afresh.
        const cache = await openCache()
        await cache?.delete(pageFontUrl(page))
        throw error
      }
      if (data.saved && font.saved) storedPages.add(page)
      // Let go while loading: the page is no longer near the reader, so its font isn't registered.
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

// Fonts are about 80 KB each, so only the pages around the reader stay registered.
export function keepPagesNear(page, distance = 4) {
  for (const [other, entry] of loaded) {
    if (Math.abs(other - page) <= distance) continue
    entry.dropped = true
    if (entry.face) document.fonts.delete(entry.face)
    loaded.delete(other)
  }
}

// Pages a download stored for a surah that hasn't finished downloading. A cancelled download takes them back, while
// a paused one keeps them for when it resumes. Pages kept from reading are never in here.
const unfinished = new Set()

async function downloadPages(pages, signal) {
  for (const page of pages) {
    signal?.throwIfAborted()
    if (storedPages.has(page)) continue
    // Marked before fetching, so a page with only one of its files stored is taken back too.
    unfinished.add(page)
    // Both files settle before moving on, so an abort can't leave one of them still writing after it's taken back.
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

// The surahs downloaded on purpose, as opposed to pages kept from reading. A page shared by several surahs stays
// until the last of them is removed. Kept out of settings backups: it describes this device's storage.
const downloaded = useLocalStorage('mushaf-downloaded-surahs', [])
const downloadedSet = computed(() => new Set(downloaded.value))

const isSurahDownloaded = (surah) =>
  downloadedSet.value.has(surah) && surahPages(surah).every((page) => storedPages.has(page))

// Whether any surah was downloaded on purpose, so the app knows to check those downloads are still whole on start.
export const hasMushafDownloads = () => downloaded.value.length > 0

// The downloads list counts the Mushaf by surah.
export const mushafDownloads = {
  // Surahs downloaded on purpose whose pages are no longer all stored: the Mushaf moved to new files, or the browser
  // cleared some of its storage. They are downloaded again.
  missing: () => downloaded.value.filter((surah) => !isSurahDownloaded(surah)),
  downloadedCount: computed(() => surahs.filter((s) => isSurahDownloaded(s.id)).length),
  isDownloaded: (key) => isSurahDownloaded(Number(key)),
  // Stops between pages once `signal` aborts, and then the surah isn't recorded as downloaded.
  async download(key, { signal } = {}) {
    const surah = Number(key)
    const pages = surahPages(surah)
    await downloadPages(pages, signal)
    signal?.throwIfAborted()
    if (!downloadedSet.value.has(surah)) downloaded.value = [...downloaded.value, surah]
    for (const page of pages) unfinished.delete(page)
  },
  // Takes back what a cancelled download of the surah stored, except pages a downloaded surah owns.
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
