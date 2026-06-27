import { describe, it, expect } from 'vitest'
import { MIN_FONT_SCALE, MAX_FONT_SCALE, DEFAULT_FONT_SCALE, clampFontScale, applyMode, applyFontScale } from './css'

describe('clampFontScale', () => {
  it('returns in-range values unchanged', () => {
    expect(clampFontScale(100)).toBe(100)
    expect(clampFontScale(MIN_FONT_SCALE)).toBe(MIN_FONT_SCALE)
    expect(clampFontScale(MAX_FONT_SCALE)).toBe(MAX_FONT_SCALE)
  })

  it('clamps to the bounds', () => {
    expect(clampFontScale(MIN_FONT_SCALE - 50)).toBe(MIN_FONT_SCALE)
    expect(clampFontScale(MAX_FONT_SCALE + 50)).toBe(MAX_FONT_SCALE)
  })

  it('rounds and coerces numeric strings', () => {
    expect(clampFontScale(100.4)).toBe(100)
    expect(clampFontScale('110')).toBe(110)
  })

  it('falls back to the default for non-finite input', () => {
    expect(clampFontScale(NaN)).toBe(DEFAULT_FONT_SCALE)
    expect(clampFontScale('abc')).toBe(DEFAULT_FONT_SCALE)
    expect(clampFontScale(undefined)).toBe(DEFAULT_FONT_SCALE)
  })
})

describe('applyMode', () => {
  it('writes the theme onto the body', () => {
    applyMode('dark')
    expect(document.body.getAttribute('data-bs-theme')).toBe('dark')

    applyMode('light')
    expect(document.body.getAttribute('data-bs-theme')).toBe('light')
  })
})

describe('applyFontScale', () => {
  it('sets the root font-size to the clamped percentage', () => {
    applyFontScale(110)
    expect(document.documentElement.style.fontSize).toBe('110%')

    applyFontScale(MAX_FONT_SCALE + 100)
    expect(document.documentElement.style.fontSize).toBe(`${MAX_FONT_SCALE}%`)

    applyFontScale('not-a-number')
    expect(document.documentElement.style.fontSize).toBe(`${DEFAULT_FONT_SCALE}%`)
  })
})
