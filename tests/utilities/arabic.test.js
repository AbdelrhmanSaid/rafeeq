import { describe, it, expect } from 'vitest'
import { normalize, removeBismillah, toArabicNumerals, formatTime, bismillahSamples } from '@/utilities/arabic'

describe('normalize', () => {
  it('strips characters that are not Arabic, Latin, or digits', () => {
    expect(normalize('hello!@#world')).toBe('helloworld')
    expect(normalize('سلام، عليكم.')).toBe('سلام عليكم')
  })

  it('lowercases Latin characters', () => {
    expect(normalize('HELLO')).toBe('hello')
  })

  it('unifies alef variants to bare alef', () => {
    expect(normalize('آمن')).toBe('امن')
    expect(normalize('إيمان')).toBe('ايمان')
    expect(normalize('أحمد')).toBe('احمد')
  })

  it('converts taa marbuta to haa', () => {
    expect(normalize('مكة')).toBe('مكه')
  })

  it('unifies hamza carriers to bare hamza', () => {
    expect(normalize('سائل')).toBe('ساءل')
    expect(normalize('مؤمن')).toBe('مءمن')
  })

  it('converts alef maqsura to yaa', () => {
    expect(normalize('على')).toBe('علي')
  })

  it('converts Arabic-Indic digits to Latin digits', () => {
    expect(normalize('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890')
  })

  it('coerces non-string input via String()', () => {
    expect(normalize(123)).toBe('123')
    expect(normalize(null)).toBe('null')
  })
})

describe('removeBismillah', () => {
  it('removes every known basmala spelling, leaving the following text', () => {
    for (const sample of bismillahSamples) {
      expect(removeBismillah(`${sample} ٱلْحَمْدُ لِلَّهِ`)).toBe('ٱلْحَمْدُ لِلَّهِ')
    }
  })

  it('strips a leading BOM before matching', () => {
    const sample = bismillahSamples[0]
    expect(removeBismillah(`﻿${sample} نص`)).toBe('نص')
  })

  it('leaves text without a basmala untouched', () => {
    expect(removeBismillah('قل هو الله أحد')).toBe('قل هو الله أحد')
  })

  it('handles null and undefined gracefully', () => {
    expect(removeBismillah(null)).toBe('')
    expect(removeBismillah(undefined)).toBe('')
  })
})

describe('toArabicNumerals', () => {
  it('converts Latin digits to Arabic-Indic numerals', () => {
    expect(toArabicNumerals('0123456789')).toBe('٠١٢٣٤٥٦٧٨٩')
  })

  it('only converts digit characters', () => {
    expect(toArabicNumerals('5/3')).toBe('٥/٣')
  })

  it('coerces numbers to strings', () => {
    expect(toArabicNumerals(42)).toBe('٤٢')
  })
})

describe('formatTime', () => {
  it('returns a zeroed clock for falsy or non-positive input', () => {
    expect(formatTime(0)).toBe('٠٠:٠٠:٠٠')
    expect(formatTime(-5)).toBe('٠٠:٠٠:٠٠')
    expect(formatTime(undefined)).toBe('٠٠:٠٠:٠٠')
  })

  it('formats seconds into HH:MM:SS with Arabic numerals', () => {
    // 1h 1m 1s
    expect(formatTime(3661)).toBe('٠١:٠١:٠١')
  })

  it('formats sub-minute durations', () => {
    expect(formatTime(45)).toBe('٠٠:٠٠:٤٥')
  })

  it('handles durations longer than an hour', () => {
    // 2h 3m 4s
    expect(formatTime(2 * 3600 + 3 * 60 + 4)).toBe('٠٢:٠٣:٠٤')
  })
})
