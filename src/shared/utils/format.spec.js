import { describe, it, expect } from 'vitest'
import { formatNumber, formatCurrency } from './format'

// ar-EG renders with Arabic-Indic digits and separators; map them back to ASCII
// so assertions describe the formatting contract rather than the glyphs.
const toAscii = (s) =>
  s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',')

describe('formatNumber', () => {
  it('always renders exactly two fraction digits', () => {
    expect(toAscii(formatNumber(0))).toBe('0.00')
    expect(toAscii(formatNumber(1234.5))).toContain('234.50')
  })

  it('groups thousands', () => {
    expect(toAscii(formatNumber(1234.5))).toBe('1,234.50')
  })
})

describe('formatCurrency', () => {
  it('defaults to EGP and keeps two fraction digits', () => {
    const out = formatCurrency(1234.5)
    expect(toAscii(out)).toContain('1,234.50')
    expect(out).toContain('ج.م')
  })

  it('honours an explicit currency', () => {
    const out = formatCurrency(10, 'USD')
    expect(toAscii(out)).toContain('10.00')
    expect(out).toContain('US$')
  })
})
