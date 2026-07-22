import { computed, toValue } from 'vue'
import { pageFontFamily } from '../fonts/qcfFontCache'

// Pages 1-2 of the Madani mushaf are ornamental (8 short centered lines).
const ORNAMENTAL_PAGES = new Set([1, 2])

// Surah 1's basmala is its own first ayah; surah 9 has none.
const hasBasmala = (surahId) => surahId !== 1 && surahId !== 9

// Groups a surah payload (see public/data/quran/*.json) into renderable
// mushaf pages: [{ page, fontFamily, lines }] where each line is
// { line, type: 'surah_name' | 'basmala' | 'ayah', centered, words }.
// Line numbers are the true printed rows, so on pages shared with another
// surah the missing rows stay empty and words keep their printed position.
export function groupIntoPages(surah) {
  const pageMap = new Map()

  const lineOf = (page, line) => {
    if (!pageMap.has(page)) pageMap.set(page, new Map())
    const lines = pageMap.get(page)
    if (!lines.has(line)) {
      lines.set(line, { line, type: 'ayah', centered: ORNAMENTAL_PAGES.has(page), words: [] })
    }
    return lines.get(line)
  }

  const pageAyahs = new Map()

  for (const ayah of surah.ayahs) {
    for (const word of ayah.words) {
      lineOf(word.p, word.l).words.push({
        glyph: word.c,
        ayah: ayah.numberInSurah,
        isAyahEnd: word.t === 'end',
      })
      if (!pageAyahs.has(word.p)) pageAyahs.set(word.p, new Map())
      pageAyahs.get(word.p).set(ayah.numberInSurah, ayah)
    }
  }

  // Synthesize the surah-name banner (and basmala) on the lines directly
  // above the surah's first word. Earlier rows belong to the previous surah.
  const firstWord = surah.ayahs[0]?.words[0]
  if (firstWord && firstWord.l > 1) {
    const basmala = hasBasmala(surah.id)
    const headerLine = firstWord.l - (basmala ? 2 : 1)
    if (headerLine >= 1) {
      const header = lineOf(firstWord.p, headerLine)
      header.type = 'surah_name'
      header.centered = true
    }
    if (basmala) {
      const basmalaLine = lineOf(firstWord.p, firstWord.l - 1)
      basmalaLine.type = 'basmala'
      basmalaLine.centered = true
    }
  }

  return [...pageMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([page, lines]) => ({
      page,
      fontFamily: pageFontFamily(page),
      lineCount: ORNAMENTAL_PAGES.has(page) ? 8 : 15,
      lines: [...lines.values()].sort((a, b) => a.line - b.line),
      // Ayahs with words on this page — drives highlighting and the
      // plain-text fallback when the page font can't load.
      ayahs: [...(pageAyahs.get(page)?.values() ?? [])],
    }))
}

export function useMushafLayout(surah) {
  return computed(() => {
    const value = toValue(surah)
    return value ? groupIntoPages(value) : []
  })
}
