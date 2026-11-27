import { describe, expect, it } from 'vitest'
import reciters from '@/features/quran/data/reciters.js'
import { recordingStyle } from './reciters'

describe('recordingStyle', () => {
  it('tells apart two recordings by the same reciter', () => {
    const basit = reciters.filter((reciter) => reciter.name === 'عبدالباسط عبدالصمد')
    expect(basit.map(recordingStyle).sort()).toEqual(['', 'مجوّد'])
  })

  it('names the riwaya of a recording not in Hafs, tidied', () => {
    expect(recordingStyle({ rewaya: 'شعبة  عن عاصم' })).toBe('شعبة عن عاصم')
    expect(recordingStyle({ rewaya: 'حفص عن عاصم' })).toBe('')
    expect(recordingStyle(undefined)).toBe('')
  })
})
