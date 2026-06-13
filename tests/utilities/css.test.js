import { describe, it, expect, beforeEach } from 'vitest'
import {
  normalizeColor,
  setVars,
  removeVars,
  applyMode,
  applyPrimaryColor,
  applyBgColor,
  syncMetaThemeColor,
} from '@/utilities/css'

beforeEach(() => {
  document.documentElement.removeAttribute('style')
  document.body.removeAttribute('style')
  document.body.removeAttribute('data-bs-theme')
  document.head.innerHTML = ''
})

describe('normalizeColor', () => {
  it('returns null for falsy or empty input', () => {
    expect(normalizeColor(null)).toBeNull()
    expect(normalizeColor('')).toBeNull()
    expect(normalizeColor('   ')).toBeNull()
  })

  it('returns null for non-string, non-array values', () => {
    expect(normalizeColor(42)).toBeNull()
    expect(normalizeColor({})).toBeNull()
  })

  it('accepts a valid named or rgb color verbatim', () => {
    expect(normalizeColor('red')).toBe('red')
    expect(normalizeColor('#ff0000')).toBe('#ff0000')
  })

  it('reads the first element when given an array', () => {
    expect(normalizeColor(['red', 'blue'])).toBe('red')
  })

  it('prepends a # for bare hex values', () => {
    expect(normalizeColor('ff0000')).toBe('#ff0000')
  })

  it('trims whitespace', () => {
    expect(normalizeColor('  red  ')).toBe('red')
  })
})

describe('setVars / removeVars', () => {
  it('sets CSS custom properties on both root and body', () => {
    setVars({ '--demo': 'red' })
    expect(document.documentElement.style.getPropertyValue('--demo')).toBe('red')
    expect(document.body.style.getPropertyValue('--demo')).toBe('red')
  })

  it('removes CSS custom properties from both root and body', () => {
    setVars({ '--demo': 'red' })
    removeVars(['--demo'])
    expect(document.documentElement.style.getPropertyValue('--demo')).toBe('')
    expect(document.body.style.getPropertyValue('--demo')).toBe('')
  })
})

describe('applyMode', () => {
  it('sets the data-bs-theme attribute on the body', () => {
    applyMode('dark')
    expect(document.body.getAttribute('data-bs-theme')).toBe('dark')
    applyMode('light')
    expect(document.body.getAttribute('data-bs-theme')).toBe('light')
  })
})

describe('applyPrimaryColor', () => {
  it('sets primary color vars for a valid color', () => {
    applyPrimaryColor('red')
    expect(document.documentElement.style.getPropertyValue('--bs-primary')).toBe('red')
    expect(document.documentElement.style.getPropertyValue('--bs-link-color')).toBe('var(--bs-primary)')
  })

  it('removes primary color vars for an invalid/empty color', () => {
    applyPrimaryColor('red')
    applyPrimaryColor(null)
    expect(document.documentElement.style.getPropertyValue('--bs-primary')).toBe('')
  })
})

describe('applyBgColor', () => {
  it('sets background color vars for a valid color', () => {
    applyBgColor('white')
    expect(document.documentElement.style.getPropertyValue('--bs-body-bg')).toBe('white')
    expect(document.documentElement.style.getPropertyValue('--bs-secondary-bg')).toContain('color-mix')
  })

  it('removes background color vars for an invalid/empty color', () => {
    applyBgColor('white')
    applyBgColor(null)
    expect(document.documentElement.style.getPropertyValue('--bs-body-bg')).toBe('')
  })
})

describe('syncMetaThemeColor', () => {
  it('does nothing when --bs-primary is not a valid color', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', 'original')
    document.head.appendChild(meta)

    syncMetaThemeColor()
    expect(meta.getAttribute('content')).toBe('original')
  })

  it('copies --bs-primary into the theme-color meta tags', () => {
    const themeMeta = document.createElement('meta')
    themeMeta.setAttribute('name', 'theme-color')
    document.head.appendChild(themeMeta)

    const tileMeta = document.createElement('meta')
    tileMeta.setAttribute('name', 'msapplication-TileColor')
    document.head.appendChild(tileMeta)

    document.documentElement.style.setProperty('--bs-primary', 'red')
    syncMetaThemeColor()

    expect(themeMeta.getAttribute('content')).toBe('red')
    expect(tileMeta.getAttribute('content')).toBe('red')
  })
})
