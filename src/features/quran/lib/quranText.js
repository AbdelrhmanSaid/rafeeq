import { PAGE_STARTS } from '../data/mushaf-index.js'

// Served beside the page layouts; built by vite.config.js, which is why this file's imports are relative.
export const QURAN_TEXT_PATH = 'data/quran-text.json'

export function quranVerses(readPage) {
  const verses = new Map()
  PAGE_STARTS.forEach((_, index) => {
    for (const [key, text] of Object.entries(readPage(index + 1).verses)) {
      verses.set(key, text.replace(/\s+/g, ' ').trim())
    }
  })
  return [...verses.values()]
}
