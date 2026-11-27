import { describe, it, expect } from 'vitest'
import { isNavGroupActive } from './useActiveNav'

describe('isNavGroupActive', () => {
  it('matches a section and its detail routes', () => {
    expect(isNavGroupActive('quran', 'quran')).toBe(true)
    expect(isNavGroupActive('quran', 'quran-surah')).toBe(true)
    expect(isNavGroupActive('radio', 'radio-station')).toBe(true)
    expect(isNavGroupActive('azkar', 'azkar-category')).toBe(true)
  })

  it('does not match other sections', () => {
    expect(isNavGroupActive('quran', 'azkar')).toBe(false)
    expect(isNavGroupActive('radio', 'home')).toBe(false)
  })

  it('keeps the More tab active on the screens it opens', () => {
    expect(isNavGroupActive('more', 'more')).toBe(true)
    expect(isNavGroupActive('more', 'settings')).toBe(true)
    expect(isNavGroupActive('more', 'settings-section')).toBe(true)
    expect(isNavGroupActive('more', 'quran')).toBe(false)
  })

  it('matches an ungrouped item only on its own route', () => {
    expect(isNavGroupActive('home', 'home')).toBe(true)
    expect(isNavGroupActive('home', 'quran')).toBe(false)
  })

  it('returns false for an unknown group', () => {
    expect(isNavGroupActive('nope', 'quran')).toBe(false)
  })
})
