import { describe, it, expect } from 'vitest'
import { groupIntoPages } from './useMushafLayout'

const word = (c, p, l, t) => ({ c, p, l, ...(t ? { t } : {}) })

// A short surah starting mid-page (header + basmala synthesized above line 3).
const shortSurah = {
  id: 112,
  ayahs: [
    {
      number: 6222,
      numberInSurah: 1,
      text: 'قل هو الله أحد',
      page: 604,
      words: [word('ﭑ', 604, 3), word('ﭒ', 604, 3), word('ﭕ', 604, 3, 'end')],
    },
    {
      number: 6223,
      numberInSurah: 2,
      text: 'الله الصمد',
      page: 604,
      words: [word('ﭖ', 604, 4), word('ﭘ', 604, 4, 'end')],
    },
  ],
}

describe('groupIntoPages', () => {
  it('groups words into pages and lines with ayah back-references', () => {
    const pages = groupIntoPages(shortSurah)

    expect(pages).toHaveLength(1)
    expect(pages[0].page).toBe(604)
    expect(pages[0].fontFamily).toBe('qcf-p604')
    expect(pages[0].lineCount).toBe(15)

    const ayahLines = pages[0].lines.filter((l) => l.type === 'ayah')
    expect(ayahLines.map((l) => l.line)).toEqual([3, 4])
    expect(ayahLines[0].words).toEqual([
      { glyph: 'ﭑ', ayah: 1, isAyahEnd: false },
      { glyph: 'ﭒ', ayah: 1, isAyahEnd: false },
      { glyph: 'ﭕ', ayah: 1, isAyahEnd: true },
    ])
  })

  it('synthesizes the surah-name banner and basmala above the first word', () => {
    const pages = groupIntoPages(shortSurah)
    const [header, basmala] = pages[0].lines

    expect(header).toMatchObject({ line: 1, type: 'surah_name', centered: true })
    expect(basmala).toMatchObject({ line: 2, type: 'basmala', centered: true })
  })

  it('skips the basmala line for surah 9', () => {
    const surah9 = { ...shortSurah, id: 9 }
    const pages = groupIntoPages(surah9)

    expect(pages[0].lines.filter((l) => l.type === 'basmala')).toHaveLength(0)
    const header = pages[0].lines.find((l) => l.type === 'surah_name')
    // Header sits directly above the first word when there is no basmala.
    expect(header.line).toBe(2)
  })

  it('treats surah 1 as having no separate basmala (it is ayah 1)', () => {
    const surah1 = {
      id: 1,
      ayahs: [
        {
          numberInSurah: 1,
          text: 'بسم الله',
          page: 1,
          words: [word('ﭑ', 1, 2), word('ﭓ', 1, 2, 'end')],
        },
      ],
    }
    const pages = groupIntoPages(surah1)

    expect(pages[0].lineCount).toBe(8)
    expect(pages[0].lines.filter((l) => l.type === 'basmala')).toHaveLength(0)
    expect(pages[0].lines.find((l) => l.type === 'surah_name').line).toBe(1)
    // Ornamental pages center every line.
    expect(pages[0].lines.every((l) => l.centered)).toBe(true)
  })

  it('splits an ayah crossing a page boundary across both pages', () => {
    const crossing = {
      id: 2,
      ayahs: [
        {
          numberInSurah: 10,
          text: 'آية',
          page: 3,
          words: [word('ﭑ', 3, 15), word('ﭒ', 4, 1), word('ﭓ', 4, 1, 'end')],
        },
      ],
    }
    const pages = groupIntoPages(crossing)

    expect(pages.map((p) => p.page)).toEqual([3, 4])
    expect(pages[0].ayahs.map((a) => a.numberInSurah)).toEqual([10])
    expect(pages[1].ayahs.map((a) => a.numberInSurah)).toEqual([10])
  })

  it('lists each page ayahs exactly once for highlighting and fallback', () => {
    const pages = groupIntoPages(shortSurah)
    expect(pages[0].ayahs.map((a) => a.numberInSurah)).toEqual([1, 2])
  })
})
