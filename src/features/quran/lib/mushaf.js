import surahs from '@/features/quran/data/surahs.js'
import { normalizeQuranicText, removeSurahPrefix } from '@/shared/utils/arabic'
import { AYAHS_STARTING, PAGE_STARTS } from '@/features/quran/data/mushaf-index.js'

// The Madinah Mushaf (King Fahd Complex, 15 lines a page), drawn with the Complex's own per-page fonts.
export const PAGE_COUNT = PAGE_STARTS.length

const FONT_BASE = 'https://static.qurancdn.com/fonts/quran/hafs/v2/woff2'

export const pageDataUrl = (page) => `/data/mushaf/${page}.json`
export const pageFontUrl = (page) => `${FONT_BASE}/p${page}.woff2`

export const isPage = (page) => Number.isInteger(page) && page >= 1 && page <= PAGE_COUNT
export const clampPage = (page) => Math.min(PAGE_COUNT, Math.max(1, Math.round(Number(page)) || 1))

export const verseKey = (surah, ayah) => `${surah}:${ayah}`

export function parseVerseKey(key) {
  const [surah, ayah] = String(key ?? '')
    .split(':')
    .map(Number)
  return isVerse(surah, ayah) ? { surah, ayah } : null
}

export const isVerse = (surah, ayah) =>
  Number.isInteger(surah) &&
  Number.isInteger(ayah) &&
  surah >= 1 &&
  surah <= surahs.length &&
  ayah >= 1 &&
  ayah <= surahs[surah - 1].numberOfAyahs

// Ayat before each surah, so an ayah's place in the whole Quran (1 to 6236) is one addition away.
const ayahsBefore = surahs.reduce((offsets, surah) => [...offsets, offsets.at(-1) + surah.numberOfAyahs], [0])

export const ayahIndex = (surah, ayah) => ayahsBefore[surah - 1] + ayah

// The last ayah index starting on or before each page.
const lastAyahByPage = AYAHS_STARTING.reduce((ends, count) => [...ends, (ends.at(-1) ?? 0) + count], [])

// The page an ayah starts on.
export function pageOfAyah(surah, ayah) {
  const index = ayahIndex(surah, ayah)
  let low = 0
  let high = lastAyahByPage.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    if (lastAyahByPage[middle] >= index) high = middle
    else low = middle + 1
  }
  return low + 1
}

export const surahStartPage = (surah) => pageOfAyah(surah, 1)

export const surahOfPage = (page) => PAGE_STARTS[page - 1][0]
export const juzOfPage = (page) => PAGE_STARTS[page - 1][1]

export const nextVerse = (surah, ayah) => {
  if (ayah < surahs[surah - 1].numberOfAyahs) return { surah, ayah: ayah + 1 }
  return surah < surahs.length ? { surah: surah + 1, ayah: 1 } : null
}

// A surah's name without the "سورة" prefix, for headers and lists.
export const surahName = (surah) => removeSurahPrefix(normalizeQuranicText(surahs[surah - 1].name))

// Every page a surah's ayat are on.
export function surahPages(surah) {
  const first = pageOfAyah(surah, 1)
  const last = pageOfAyah(surah, surahs[surah - 1].numberOfAyahs)
  return Array.from({ length: last - first + 1 }, (_, i) => first + i)
}
