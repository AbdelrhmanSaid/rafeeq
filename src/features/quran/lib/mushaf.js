import surahs from '@/features/quran/data/surahs.js'
import { normalizeQuranicText, removeSurahPrefix, toArabicNumerals } from '@/shared/utils/arabic'
import { AYAHS_STARTING, PAGE_STARTS } from '@/features/quran/data/mushaf-index.js'

export const PAGE_COUNT = PAGE_STARTS.length

// Both are served with the app: the page layouts and the Complex's V4 page fonts, with their tajweed colours removed.
export const pageDataUrl = (page) => `/data/mushaf/${page}.json`
export const pageFontUrl = (page) => `/fonts/mushaf/p${page}.woff2`

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

const ayahsBefore = surahs.reduce((offsets, surah) => [...offsets, offsets.at(-1) + surah.numberOfAyahs], [0])

export const ayahIndex = (surah, ayah) => ayahsBefore[surah - 1] + ayah

// The other way round: the verse an ayahIndex counts up to.
export function verseAt(index) {
  const surah = ayahsBefore.findIndex((before) => before >= index)
  return { surah, ayah: index - ayahsBefore[surah - 1] }
}

const lastAyahByPage = AYAHS_STARTING.reduce((ends, count) => [...ends, (ends.at(-1) ?? 0) + count], [])

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

const lastOpeningOnPage = new Map(surahs.map((_, i) => [surahStartPage(i + 1), i + 1]))

// A page belongs to the last surah opening on it, even if the previous one ends at its top (293 is al-Kahf's).
export const readingSurahOfPage = (page) => lastOpeningOnPage.get(page) ?? surahOfPage(page)

export const nextVerse = (surah, ayah) => {
  if (ayah < surahs[surah - 1].numberOfAyahs) return { surah, ayah: ayah + 1 }
  return surah < surahs.length ? { surah: surah + 1, ayah: 1 } : null
}

// "٧ آيات", "١١٠ آية": Arabic counts ending in 3–10 take the plural, the rest the singular.
export const formatAyahCount = (count) => {
  const lastTwo = count % 100
  return `${toArabicNumerals(count)} ${lastTwo >= 3 && lastTwo <= 10 ? 'آيات' : 'آية'}`
}

export const surahName = (surah) => removeSurahPrefix(normalizeQuranicText(surahs[surah - 1].name))

export const plainSurahName = (surah) => surahName(surah).replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g, '')

export function surahPages(surah) {
  const first = pageOfAyah(surah, 1)
  const last = pageOfAyah(surah, surahs[surah - 1].numberOfAyahs)
  return Array.from({ length: last - first + 1 }, (_, i) => first + i)
}
