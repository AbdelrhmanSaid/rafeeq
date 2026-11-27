import { computed, reactive } from 'vue'
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

// A file from the device if it's there, else from the network, kept for next time. `saved` says whether it's on the
// device now: a full disk only costs the offline copy, but then the page mustn't be counted as downloaded.
async function fetchStored(url) {
  const cache = await openCache()
  const stored = await cache?.match(url)
  if (stored) return { response: stored, saved: true }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  const saved = cache
    ? await cache.put(url, response.clone()).then(
        () => true,
        () => false,
      )
    : false
  return { response, saved }
}

const fontFamily = (page) => `mushaf-p${page}`

// Pages in memory, each with its layout and its registered font.
const loaded = new Map()

// A page ready to draw: its layout and the name of its loaded font.
export function loadPage(page) {
  if (!loaded.has(page)) {
    const entry = { dropped: false, face: null }
    entry.promise = (async () => {
      const [data, font] = await Promise.all([fetchStored(pageDataUrl(page)), fetchStored(pageFontUrl(page))])
      const face = new FontFace(fontFamily(page), await font.response.arrayBuffer())
      const [json] = await Promise.all([data.response.json(), face.load()])
      if (data.saved && font.saved) storedPages.add(page)
      // Let go while loading: the page is no longer near the reader, so its font isn't registered.
      if (!entry.dropped) {
        entry.face = face
        document.fonts.add(face)
      }
      return { data: json, fontFamily: fontFamily(page) }
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

export async function downloadPages(pages) {
  for (const page of pages) {
    if (storedPages.has(page)) continue
    const files = await Promise.all([fetchStored(pageDataUrl(page)), fetchStored(pageFontUrl(page))])
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

const isSurahStored = (surah) => surahPages(surah).every((page) => storedPages.has(page))

// The downloads list counts the Mushaf by surah.
export const mushafDownloads = {
  downloadedCount: computed(() => surahs.filter((s) => isSurahStored(s.id)).length),
  isDownloaded: (key) => isSurahStored(Number(key)),
  download: (key) => downloadPages(surahPages(Number(key))),
  // Removes all of the surah's pages, so it reads as removed even when it shares a page with a surah that stays;
  // that surah then shows as needing that page again.
  remove: (key) => removePages(surahPages(Number(key))),
  async removeAll() {
    if (hasCacheStorage()) await caches.delete(CACHE_NAME)
    storedPages.clear()
  },
}
