import { describe, expect, it } from 'vitest'
import surahs from '@/features/quran/data/surahs.js'
import { ayahIndex } from './mushaf'
import { quranVerses } from './quranText'
import { readVerses } from './quranText.testing'

describe('quranVerses', () => {
  it('lists every ayah once, in Mushaf order', () => {
    const verses = readVerses()

    expect(verses).toHaveLength(surahs.reduce((total, surah) => total + surah.numberOfAyahs, 0))
    expect(verses[0].normalize('NFC')).toBe('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'.normalize('NFC'))
    expect(verses[ayahIndex(112, 1) - 1].normalize('NFC')).toBe('قُلْ هُوَ ٱللَّهُ أَحَدٌ'.normalize('NFC'))
    expect(verses.at(-1).normalize('NFC')).toBe('مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ'.normalize('NFC'))
  })

  it('keeps an ayah that runs over two pages once, and its words one space apart', () => {
    const pages = { 1: { verses: { '1:1': 'أ  ب ', '1:2': 'ج' } }, 2: { verses: { '1:2': 'ج', '1:3': 'د' } } }
    const verses = quranVerses((page) => pages[page] ?? { verses: {} })

    expect(verses).toEqual(['أ ب', 'ج', 'د'])
  })
})
