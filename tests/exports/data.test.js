import { describe, it, expect } from 'vitest'
import surahs from '@/exports/QuranSurahs.js'
import reciters from '@/exports/QuranReciters.js'
import categories from '@/exports/AzkarCategories.js'
import radios from '@/exports/Radios.js'

describe('QuranSurahs data', () => {
  it('contains exactly 114 surahs', () => {
    expect(surahs).toHaveLength(114)
  })

  it('is numbered sequentially from 1 to 114', () => {
    surahs.forEach((s, i) => expect(s.id).toBe(i + 1))
  })

  it('every surah has a name, ayah count, and meccan flag', () => {
    for (const s of surahs) {
      expect(typeof s.name).toBe('string')
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.numberOfAyahs).toBeGreaterThan(0)
      expect(typeof s.isMeccan).toBe('boolean')
    }
  })

  it('starts with Al-Fatiha (7 ayahs) and ends with An-Nas', () => {
    expect(surahs[0].numberOfAyahs).toBe(7)
    expect(surahs[113].id).toBe(114)
  })
})

describe('QuranReciters data', () => {
  it('is a non-empty list with unique ids', () => {
    expect(reciters.length).toBeGreaterThan(0)
    const ids = reciters.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the default reciter (id 51)', () => {
    expect(reciters.some((r) => r.id === 51)).toBe(true)
  })

  it('every reciter has a name and an https folder url ending with a slash', () => {
    for (const r of reciters) {
      expect(typeof r.name).toBe('string')
      expect(r.name.length).toBeGreaterThan(0)
      expect(r.folder_url).toMatch(/^https:\/\/.+\/$/)
    }
  })
})

describe('AzkarCategories data', () => {
  it('is a non-empty list with unique slugs', () => {
    expect(categories.length).toBeGreaterThan(0)
    const slugs = categories.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every category has a slug and a name', () => {
    for (const c of categories) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/)
      expect(typeof c.name).toBe('string')
      expect(c.name.length).toBeGreaterThan(0)
    }
  })
})

describe('Radios data', () => {
  it('maps slugs to stations with a name and https url', () => {
    const entries = Object.entries(radios)
    expect(entries.length).toBeGreaterThan(0)

    for (const [slug, station] of entries) {
      expect(slug.length).toBeGreaterThan(0)
      expect(typeof station.name).toBe('string')
      expect(station.name.length).toBeGreaterThan(0)
      expect(station.url).toMatch(/^https:\/\//)
    }
  })
})
