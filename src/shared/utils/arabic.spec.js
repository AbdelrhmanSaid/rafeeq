import { describe, it, expect } from 'vitest'
import { normalize, removeBismillah, toArabicNumerals, formatTime, BISMILLAH_VARIANTS } from './arabic'

describe('normalize', () => {
  it('strips tashkeel (diacritics)', () => {
    expect(normalize('مُحَمَّد')).toBe('محمد')
  })

  it('folds alef variants to ا', () => {
    expect(normalize('أإآ')).toBe('ااا')
    expect(normalize('القرآن')).toBe('القران')
  })

  it('folds ة → ه, ى → ي, and ئ/ؤ → ء', () => {
    expect(normalize('مدرسة')).toBe('مدرسه')
    expect(normalize('مصطفى')).toBe('مصطفي')
    expect(normalize('مسئول')).toBe('مسءول')
    expect(normalize('مؤمن')).toBe('مءمن')
  })

  it('removes punctuation and ornate symbols but keeps spaces', () => {
    expect(normalize('السلام، عليكم')).toBe('السلام عليكم')
    expect(normalize('﴿آية﴾')).toBe('ايه')
  })

  it('converts Arabic-Indic digits to ASCII and lowercases latin', () => {
    expect(normalize('٠١٢٣')).toBe('0123')
    expect(normalize('Hello World 123')).toBe('hello world 123')
  })
})

describe('toArabicNumerals', () => {
  it('maps ASCII digits to Arabic-Indic digits', () => {
    expect(toArabicNumerals(2024)).toBe('٢٠٢٤')
    expect(toArabicNumerals('1:30')).toBe('١:٣٠')
    expect(toArabicNumerals(0)).toBe('٠')
  })

  it('leaves non-digit characters untouched', () => {
    expect(toArabicNumerals('v1.2')).toBe('v١.٢')
  })
})

describe('formatTime', () => {
  it('returns a zeroed clock for falsy or non-positive input', () => {
    expect(formatTime(0)).toBe('٠٠:٠٠:٠٠')
    expect(formatTime(-5)).toBe('٠٠:٠٠:٠٠')
    expect(formatTime(undefined)).toBe('٠٠:٠٠:٠٠')
  })

  it('formats seconds as HH:MM:SS in Arabic numerals', () => {
    expect(formatTime(65)).toBe('٠٠:٠١:٠٥')
    expect(formatTime(3600)).toBe('٠١:٠٠:٠٠')
    expect(formatTime(3661)).toBe('٠١:٠١:٠١')
  })
})

describe('removeBismillah', () => {
  it('removes each known basmala variant and trims the remainder', () => {
    for (const variant of BISMILLAH_VARIANTS) {
      expect(removeBismillah(`${variant} الْحَمْدُ لِلَّهِ`)).toBe('الْحَمْدُ لِلَّهِ')
      expect(removeBismillah(`﻿${variant}`)).toBe('')
    }
  })

  it('strips a leading BOM', () => {
    expect(removeBismillah('﻿نص عادي')).toBe('نص عادي')
  })

  it('leaves text without a basmala unchanged', () => {
    expect(removeBismillah('نص عادي')).toBe('نص عادي')
  })

  it('handles null and undefined gracefully', () => {
    expect(removeBismillah(null)).toBe('')
    expect(removeBismillah(undefined)).toBe('')
  })
})
