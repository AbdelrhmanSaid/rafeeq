import { describe, expect, it } from 'vitest'
import { normalizeNumberInput, toInputDisplay } from './numberInput'

describe('normalizeNumberInput', () => {
  it('reads Arabic-Indic, Persian and Western digits alike', () => {
    expect(normalizeNumberInput('١٢٣٤٥٦').value).toBe('123456')
    expect(normalizeNumberInput('۱۲۳۴۵۶').value).toBe('123456')
    expect(normalizeNumberInput('12٣4').value).toBe('1234')
  })

  it('takes "." or the Arabic decimal sign as the decimal point, once', () => {
    expect(normalizeNumberInput('١٢٫٥').value).toBe('12.5')
    expect(normalizeNumberInput('12.5').value).toBe('12.5')
    expect(normalizeNumberInput('1.2.3').value).toBe('1.23')
  })

  it('drops grouping marks and anything else', () => {
    expect(normalizeNumberInput('١٬٢٣٤٬٥٦٧').value).toBe('1234567')
    expect(normalizeNumberInput('1,234').value).toBe('1234')
    expect(normalizeNumberInput('-12 ج.م').value).toBe('12.')
    expect(normalizeNumberInput('abc').value).toBe('')
  })

  it('takes no decimal point for counts', () => {
    expect(normalizeNumberInput('١٢٫٥', undefined, { integer: true }).value).toBe('125')
  })

  it('keeps the caret after the same characters', () => {
    expect(normalizeNumberInput('١x٢٣', 2)).toEqual({ value: '123', caret: 1 })
    expect(normalizeNumberInput('١٢٣', 2)).toEqual({ value: '123', caret: 2 })
    expect(normalizeNumberInput('١٬٢٣٤', 5)).toEqual({ value: '1234', caret: 4 })
  })
})

describe('toInputDisplay', () => {
  it('shows Arabic-Indic digits and the Arabic decimal sign', () => {
    expect(toInputDisplay('1234.5')).toBe('١٢٣٤٫٥')
    expect(toInputDisplay('')).toBe('')
    expect(toInputDisplay(null)).toBe('')
  })

  it('round-trips through normalizeNumberInput', () => {
    expect(normalizeNumberInput(toInputDisplay('9876.05')).value).toBe('9876.05')
  })
})
