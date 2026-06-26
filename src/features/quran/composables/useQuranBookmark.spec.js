import { beforeEach, describe, it, expect } from 'vitest'
import { useQuranBookmark } from './useQuranBookmark'

describe('useQuranBookmark', () => {
  beforeEach(() => {
    localStorage.clear()
    useQuranBookmark().clearBookmark()
  })

  it('starts with no bookmark', () => {
    const { bookmark } = useQuranBookmark()
    expect(bookmark.value).toBeNull()
  })

  it('sets a bookmark and reports it as bookmarked', () => {
    const { setBookmark, isBookmarked, bookmark } = useQuranBookmark()
    setBookmark({ surahId: 2, surahName: 'البقرة', ayahNumber: 5, text: 'آية' })

    expect(bookmark.value).toEqual({ surahId: 2, surahName: 'البقرة', ayahNumber: 5, text: 'آية' })
    expect(isBookmarked(2, 5)).toBe(true)
    expect(isBookmarked('2', 5)).toBe(true)
    expect(isBookmarked(2, 6)).toBe(false)
  })

  it('replaces any previous bookmark when a new one is set', () => {
    const { setBookmark, isBookmarked } = useQuranBookmark()
    setBookmark({ surahId: 2, surahName: 'البقرة', ayahNumber: 5, text: 'أولى' })
    setBookmark({ surahId: 18, surahName: 'الكهف', ayahNumber: 10, text: 'ثانية' })

    expect(isBookmarked(2, 5)).toBe(false)
    expect(isBookmarked(18, 10)).toBe(true)
  })

  it('toggles a bookmark on and off for the same ayah', () => {
    const { toggleBookmark, isBookmarked } = useQuranBookmark()
    const ayah = { surahId: 36, surahName: 'يس', ayahNumber: 1, text: 'يس' }

    toggleBookmark(ayah)
    expect(isBookmarked(36, 1)).toBe(true)

    toggleBookmark(ayah)
    expect(isBookmarked(36, 1)).toBe(false)
  })

  it('clears the bookmark', () => {
    const { setBookmark, clearBookmark, bookmark } = useQuranBookmark()
    setBookmark({ surahId: 1, surahName: 'الفاتحة', ayahNumber: 2, text: 'الحمد لله' })
    clearBookmark()
    expect(bookmark.value).toBeNull()
  })
})
