import { computed, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import surahs from '@/features/quran/data/surahs.js'
import { pageDataUrl, pageFontUrl, surahPages } from '@/features/quran/lib/mushaf'

// Every page read or downloaded stays on the device: its layout and its font, kept together in one cache so a stored
// page always opens offline. The cache name changes only if the files themselves ever change.
const CACHE_NAME = 'mushaf-v1'

const hasCacheStorage = () => typeof caches !== 'undefined'
const openCache = () => (hasCacheStorage() ? caches.open(CACHE_NAME).catch(() => null) : Promise.resolve(null))

// Pages with both files stored.
export const storedPages = reactive(new Set())

let scanned = null

// Read once what earlier sessions stored, so the downloads list shows it.
export function scanStoredPages() {
  scanned ??= (async () => {
    const cache = await openCache()
    if (!cache) return
    const urls = new Set((await cache.keys()).map((request) => request.url))
    const absolute = (url) => new URL(url, location.origin).href
    for (let page = 1; page <= 604; page++) {
      if (urls.has(absolute(pageDataUrl(page))) && urls.has(pageFontUrl(page))) storedPages.add(page)
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
async function fetchStored(url, check) {
  const cache = await openCache()
  const stored = await cache?.match(url)
  if (stored) {
    try {
      return { value: check(await stored.arrayBuffer()), saved: true }
    } catch {
      await cache.delete(url)
    }
  }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const buffer = await response.arrayBuffer()
  const value = check(buffer)
  const saved = cache
    ? await cache.put(url, new Response(buffer, { headers: response.headers })).then(
        () => true,
        () => false,
      )
    : false
  return { value, saved }
}

const fetchLayout = (page) => fetchStored(pageDataUrl(page), checkLayout)
const fetchFont = (page) => fetchStored(pageFontUrl(page), checkFont)

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

async function downloadPages(pages) {
  for (const page of pages) {
    if (storedPages.has(page)) continue
    const files = await Promise.all([fetchLayout(page), fetchFont(page)])
    if (!files.every((file) => file.saved)) throw new Error(`Could not store page ${page}`)
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

// The downloads list counts the Mushaf by surah.
export const mushafDownloads = {
  downloadedCount: computed(() => surahs.filter((s) => isSurahDownloaded(s.id)).length),
  isDownloaded: (key) => isSurahDownloaded(Number(key)),
  async download(key) {
    const surah = Number(key)
    await downloadPages(surahPages(surah))
    if (!downloadedSet.value.has(surah)) downloaded.value = [...downloaded.value, surah]
  },
  async remove(key) {
    const surah = Number(key)
    downloaded.value = downloaded.value.filter((id) => id !== surah)
    const kept = new Set(downloaded.value.flatMap((id) => surahPages(id)))
    await removePages(surahPages(surah).filter((page) => !kept.has(page)))
  },
  async removeAll() {
    downloaded.value = []
    if (hasCacheStorage()) await caches.delete(CACHE_NAME)
    storedPages.clear()
  },
}
