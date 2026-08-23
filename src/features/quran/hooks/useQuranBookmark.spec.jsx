import { beforeEach, describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useQuranBookmark } from './useQuranBookmark'

const setup = () => renderHook(() => useQuranBookmark())

describe('useQuranBookmark', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no bookmark', () => {
    expect(setup().result.current.bookmark).toBeNull()
  })

  it('sets a bookmark and reports it as bookmarked', () => {
    const { result } = setup()

    act(() => result.current.setBookmark({ surahId: 2, surahName: 'البقرة', ayahNumber: 5, text: 'آية' }))

    expect(result.current.bookmark).toEqual({ surahId: 2, surahName: 'البقرة', ayahNumber: 5, text: 'آية' })
    expect(result.current.isBookmarked(2, 5)).toBe(true)
    expect(result.current.isBookmarked('2', 5)).toBe(true)
    expect(result.current.isBookmarked(2, 6)).toBe(false)
  })

  it('replaces any previous bookmark when a new one is set', () => {
    const { result } = setup()

    act(() => result.current.setBookmark({ surahId: 2, surahName: 'البقرة', ayahNumber: 5, text: 'أولى' }))
    act(() => result.current.setBookmark({ surahId: 18, surahName: 'الكهف', ayahNumber: 10, text: 'ثانية' }))

    expect(result.current.isBookmarked(2, 5)).toBe(false)
    expect(result.current.isBookmarked(18, 10)).toBe(true)
  })

  it('toggles a bookmark on and off for the same ayah', () => {
    const { result } = setup()
    const ayah = { surahId: 36, surahName: 'يس', ayahNumber: 1, text: 'يس' }

    act(() => result.current.toggleBookmark(ayah))
    expect(result.current.isBookmarked(36, 1)).toBe(true)

    act(() => result.current.toggleBookmark(ayah))
    expect(result.current.isBookmarked(36, 1)).toBe(false)
  })

  it('shares the bookmark between every component that reads it', () => {
    const first = setup()
    const second = setup()

    act(() => first.result.current.setBookmark({ surahId: 1, surahName: 'الفاتحة', ayahNumber: 2, text: 'الحمد لله' }))

    expect(second.result.current.isBookmarked(1, 2)).toBe(true)
  })

  it('clears the bookmark', () => {
    const { result } = setup()

    act(() => result.current.setBookmark({ surahId: 1, surahName: 'الفاتحة', ayahNumber: 2, text: 'الحمد لله' }))
    act(() => result.current.clearBookmark())

    expect(result.current.bookmark).toBeNull()
  })
})
