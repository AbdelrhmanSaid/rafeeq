import { describe, it, expect } from 'vitest'
import { isNavGroupActive } from './useActiveNav'

describe('isNavGroupActive', () => {
  it('matches a section and its detail routes', () => {
    expect(isNavGroupActive('quran', '/quran')).toBe(true)
    expect(isNavGroupActive('quran', '/quran/2')).toBe(true)
    expect(isNavGroupActive('radio', '/radio/makkah')).toBe(true)
    expect(isNavGroupActive('azkar', '/azkar/morning')).toBe(true)
  })

  it('does not match other sections', () => {
    expect(isNavGroupActive('quran', '/azkar')).toBe(false)
    expect(isNavGroupActive('radio', '/')).toBe(false)
  })

  it('does not match a path that merely starts with the same characters', () => {
    expect(isNavGroupActive('quran', '/quranic')).toBe(false)
  })

  it('returns false for an unknown group', () => {
    expect(isNavGroupActive('nope', '/quran')).toBe(false)
  })
})
