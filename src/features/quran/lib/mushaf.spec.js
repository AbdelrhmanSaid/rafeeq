import { describe, expect, it } from 'vitest'
import {
  ayahIndex,
  clampPage,
  juzOfPage,
  nextVerse,
  pageOfAyah,
  parseVerseKey,
  plainSurahName,
  readingSurahOfPage,
  surahOfPage,
  surahPages,
  surahStartPage,
} from './mushaf'

describe('mushaf', () => {
  it('numbers ayat across the whole Quran', () => {
    expect(ayahIndex(1, 1)).toBe(1)
    expect(ayahIndex(2, 1)).toBe(8)
    expect(ayahIndex(114, 6)).toBe(6236)
  })

  it('finds the page an ayah starts on', () => {
    expect(pageOfAyah(1, 1)).toBe(1)
    expect(pageOfAyah(2, 1)).toBe(2)
    expect(pageOfAyah(2, 255)).toBe(42)
    expect(pageOfAyah(18, 1)).toBe(293)
    expect(pageOfAyah(36, 1)).toBe(440)
    expect(pageOfAyah(114, 6)).toBe(604)
  })

  // 5:77 is one of the ayat the source API filed under the wrong page.
  it('places ayat by where their words are', () => {
    expect(pageOfAyah(5, 77)).toBe(120)
    expect(pageOfAyah(5, 78)).toBe(121)
  })

  it('opens a surah on the page of its first ayah, not of its title', () => {
    expect(surahStartPage(4)).toBe(77)
  })

  it('lists every page a surah is on', () => {
    expect(surahPages(1)).toEqual([1])
    expect(surahPages(112)).toEqual([604])
    expect(surahPages(18)).toEqual(Array.from({ length: 12 }, (_, i) => 293 + i))
  })

  it('reads verse keys and rejects ones that are not ayat', () => {
    expect(parseVerseKey('2:255')).toEqual({ surah: 2, ayah: 255 })
    expect(parseVerseKey('1:8')).toBe(null)
    expect(parseVerseKey('115:1')).toBe(null)
    expect(parseVerseKey('nope')).toBe(null)
  })

  it('steps on into the next surah', () => {
    expect(nextVerse(1, 7)).toEqual({ surah: 2, ayah: 1 })
    expect(nextVerse(2, 1)).toEqual({ surah: 2, ayah: 2 })
    expect(nextVerse(114, 6)).toBe(null)
  })

  it('keeps page numbers inside the Mushaf', () => {
    expect(clampPage('0')).toBe(1)
    expect(clampPage('900')).toBe(604)
    expect(clampPage('abc')).toBe(1)
    expect(clampPage('42')).toBe(42)
  })

  it('names the surah being read on a page, which is the one opening there rather than one ending at its top', () => {
    expect(surahOfPage(293)).toBe(17)
    expect(readingSurahOfPage(293)).toBe(18)
    expect(readingSurahOfPage(294)).toBe(18)
    expect(readingSurahOfPage(76)).toBe(3)
    expect(readingSurahOfPage(604)).toBe(114)
    expect(readingSurahOfPage(1)).toBe(1)
  })

  it('knows the juz a page starts in', () => {
    expect(juzOfPage(1)).toBe(1)
    expect(juzOfPage(293)).toBe(15)
    expect(juzOfPage(604)).toBe(30)
  })

  it('writes surah names without vowel marks for small print', () => {
    expect(plainSurahName(18)).toBe('الكهف')
    expect(plainSurahName(3)).toBe('آل عمران')
  })
})
