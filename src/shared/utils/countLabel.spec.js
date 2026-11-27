import { describe, expect, it } from 'vitest'
import { countLabel } from './countLabel'

const ITEM_FORMS = { one: 'عنصر واحد', two: 'عنصرين', few: 'عناصر', many: 'عنصرًا', other: 'عنصر' }

const items = (count) => countLabel(count, ITEM_FORMS)

describe('countLabel', () => {
  it('names one and two without a number', () => {
    expect(items(1)).toBe('عنصر واحد')
    expect(items(2)).toBe('عنصرين')
  })

  it('uses the plural from 3 to 10', () => {
    expect(items(3)).toBe('٣ عناصر')
    expect(items(10)).toBe('١٠ عناصر')
  })

  it('uses the accusative singular from 11 to 99', () => {
    expect(items(11)).toBe('١١ عنصرًا')
    expect(items(99)).toBe('٩٩ عنصرًا')
  })

  it('follows the last two digits past 100', () => {
    expect(items(100)).toBe('١٠٠ عنصر')
    expect(items(102)).toBe('١٠٢ عنصر')
    expect(items(105)).toBe('١٠٥ عناصر')
    expect(items(111)).toBe('١١١ عنصرًا')
  })

  it('uses the singular for none', () => {
    expect(items(0)).toBe('٠ عنصر')
  })
})
