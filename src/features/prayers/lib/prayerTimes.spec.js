import { afterEach, describe, expect, it } from 'vitest'
import { calculatePrayerTimes, resolveAutoMethod } from './prayerTimes'

const CAIRO = { latitude: 30.0444, longitude: 31.2357 }
const MAKKAH = { latitude: 21.4225, longitude: 39.8262 }
const LONDON = { latitude: 51.5074, longitude: -0.1278 }

const utcTimes = (times) =>
  Object.fromEntries(Object.entries(times).map(([k, v]) => [k, v.toISOString().slice(11, 16)]))
const minutesBetween = (a, b) => (b - a) / 60000

const originalTz = process.env.TZ
afterEach(() => {
  process.env.TZ = originalTz
})

describe('calculatePrayerTimes', () => {
  // Reference values cross-checked against the PrayTimes algorithm Aladhan is built on.
  it('computes the Egyptian method times for Cairo', () => {
    const times = calculatePrayerTimes({ ...CAIRO, date: new Date(2026, 9, 29), method: '5' })

    expect(utcTimes(times)).toEqual({
      Fajr: '02:39',
      Sunrise: '04:07',
      Dhuhr: '09:39',
      Asr: '12:47',
      Maghrib: '15:11',
      Isha: '16:29',
    })
  })

  it('places Umm al-Qura Isha 90 minutes after Maghrib', () => {
    const times = calculatePrayerTimes({ ...MAKKAH, date: new Date(2026, 9, 29), method: '4' })

    expect(utcTimes(times)).toMatchObject({ Fajr: '02:05', Maghrib: '14:46', Isha: '16:16' })
    expect(minutesBetween(times.Maghrib, times.Isha)).toBe(90)
  })

  it('applies the Jordan Maghrib offset', () => {
    const date = new Date(2026, 9, 29)
    const mwl = calculatePrayerTimes({ ...CAIRO, date, method: '3' })
    const jordan = calculatePrayerTimes({ ...CAIRO, date, method: '23' })

    expect(minutesBetween(mwl.Maghrib, jordan.Maghrib)).toBe(5)
  })

  it('delays Asr for the Hanafi school', () => {
    const date = new Date(2026, 9, 29)
    const shafi = calculatePrayerTimes({ ...CAIRO, date, method: '5', school: '0' })
    const hanafi = calculatePrayerTimes({ ...CAIRO, date, method: '5', school: '1' })

    expect(hanafi.Asr > shafi.Asr).toBe(true)
    expect(hanafi.Dhuhr).toEqual(shafi.Dhuhr)
  })

  it('uses the nearest authority when the method is automatic', () => {
    const date = new Date(2026, 9, 29)

    expect(calculatePrayerTimes({ ...CAIRO, date, method: '' })).toEqual(
      calculatePrayerTimes({ ...CAIRO, date, method: '5' }),
    )
  })

  it('computes the local calendar day, not the UTC one', () => {
    process.env.TZ = 'Asia/Riyadh'
    // 00:30 on Oct 29 in Riyadh is still Oct 28 in UTC.
    const date = new Date('2026-10-28T21:30:00Z')
    const times = calculatePrayerTimes({ ...MAKKAH, date, method: '4' })

    expect(times.Fajr.getDate()).toBe(29)
    expect(times).toEqual(calculatePrayerTimes({ ...MAKKAH, date: new Date(2026, 9, 29), method: '4' }))
  })

  it('follows daylight saving in the device timezone', () => {
    process.env.TZ = 'Europe/London'
    // UK clocks go back on Oct 25, 2026, so solar noon moves from ~12:44 BST to ~11:44 GMT.
    const before = calculatePrayerTimes({ ...LONDON, date: new Date(2026, 9, 24), method: '3' })
    const after = calculatePrayerTimes({ ...LONDON, date: new Date(2026, 9, 25), method: '3' })

    expect(before.Dhuhr.getHours()).toBe(12)
    expect(after.Dhuhr.getHours()).toBe(11)
  })

  it('still returns valid times inside the polar circle', () => {
    const times = calculatePrayerTimes({ latitude: 69.6492, longitude: 18.9553, date: new Date(2026, 5, 21) })

    for (const time of Object.values(times)) expect(Number.isNaN(time.getTime())).toBe(false)
  })
})

describe('resolveAutoMethod', () => {
  it.each([
    ['Cairo', 30.0444, 31.2357, '5'],
    ['Alexandria', 31.2001, 29.9187, '5'],
    ['Makkah', 21.4225, 39.8262, '4'],
    ['Riyadh', 24.7136, 46.6753, '4'],
    ['New York', 40.7128, -74.006, '2'],
    ['Istanbul', 41.0082, 28.9784, '13'],
    ['Jakarta', -6.2088, 106.8456, '20'],
    ['Amman', 31.9454, 35.9284, '23'],
  ])('picks the regional authority for %s', (_, lat, lng, method) => {
    expect(resolveAutoMethod(lat, lng)).toBe(method)
  })

  it('falls back to the Muslim World League far from any authority', () => {
    expect(resolveAutoMethod(-33.8688, 151.2093)).toBe('3')
  })
})
