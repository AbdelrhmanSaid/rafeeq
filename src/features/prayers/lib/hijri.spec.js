import { afterEach, describe, expect, it } from 'vitest'
import { getHijriDate } from './hijri'

const originalTz = process.env.TZ
afterEach(() => {
  process.env.TZ = originalTz
})

describe('getHijriDate', () => {
  it('returns the Umm al-Qura date parts in Arabic', () => {
    expect(getHijriDate(new Date(2026, 9, 29, 12))).toEqual({
      weekday: 'الخميس',
      day: '18',
      month: 'جمادى الأولى',
      year: '1448',
    })
  })

  it('uses the local calendar day', () => {
    process.env.TZ = 'Asia/Riyadh'
    // 00:30 on Thursday in Riyadh is still Wednesday in UTC.
    expect(getHijriDate(new Date('2026-10-28T21:30:00Z'))).toMatchObject({ weekday: 'الخميس', day: '18' })
  })
})
