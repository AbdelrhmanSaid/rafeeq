import { describe, expect, it } from 'vitest'
import { getSimilarStations } from './similarStations'

const radios = {
  a: { name: 'أحمد', category: 'reciters' },
  b: { name: 'الحصري', description: 'مرتل', category: 'reciters' },
  c: { name: 'الحصري', description: 'مجود', category: 'reciters' },
  d: { name: 'خالد', category: 'reciters' },
  e: { name: 'سعد', category: 'reciters' },
  f: { name: 'الإنجليزية', category: 'translations' },
}

const slugs = (stations) => stations.map((station) => station.slug)

describe('getSimilarStations', () => {
  it("puts the same reciter's other recitations first, then the nearest stations in the section", () => {
    expect(slugs(getSimilarStations('c', radios, 3))).toEqual(['b', 'd', 'a'])
  })

  it('stays within the station’s section', () => {
    expect(slugs(getSimilarStations('a', radios))).not.toContain('f')
  })

  it('returns nothing for an unknown station', () => {
    expect(getSimilarStations('missing', radios)).toEqual([])
  })
})
