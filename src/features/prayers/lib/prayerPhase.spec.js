import { describe, expect, it } from 'vitest'
import { getNextPrayerKey, getPrayerPhase } from './prayerPhase'

const day = '2026-08-24'
const timings = {
  Fajr: `${day}T04:12:00`,
  Sunrise: `${day}T05:38:00`,
  Dhuhr: `${day}T12:05:00`,
  Asr: `${day}T15:32:00`,
  Maghrib: `${day}T18:41:00`,
  Isha: `${day}T20:02:00`,
}

const at = (time) => new Date(`${day}T${time}`).getTime()

describe('getNextPrayerKey', () => {
  it('returns Fajr before dawn', () => {
    expect(getNextPrayerKey(at('03:00:00'), timings)).toBe('Fajr')
  })

  it('returns the following prayer during the day', () => {
    expect(getNextPrayerKey(at('04:30:00'), timings)).toBe('Sunrise')
    expect(getNextPrayerKey(at('13:00:00'), timings)).toBe('Asr')
    expect(getNextPrayerKey(at('19:00:00'), timings)).toBe('Isha')
  })

  it('returns Fajr after Isha', () => {
    expect(getNextPrayerKey(at('21:00:00'), timings)).toBe('Fajr')
  })

  it('returns null without timings', () => {
    expect(getNextPrayerKey(at('13:00:00'), null)).toBeNull()
  })
})

describe('getPrayerPhase', () => {
  it('marks the next prayer even when its clock time is earlier today', () => {
    const now = at('21:00:00')
    const next = getNextPrayerKey(now, timings)

    expect(getPrayerPhase('Fajr', next, now, timings)).toBe('next')
    expect(getPrayerPhase('Isha', next, now, timings)).toBe('past')
  })

  it('keeps later prayers quiet before Fajr', () => {
    const now = at('03:00:00')
    const next = getNextPrayerKey(now, timings)

    expect(getPrayerPhase('Fajr', next, now, timings)).toBe('next')
    expect(getPrayerPhase('Dhuhr', next, now, timings)).toBe('later')
  })

  it('splits the day into past, next, and later', () => {
    const now = at('13:00:00')
    const next = getNextPrayerKey(now, timings)

    expect(getPrayerPhase('Fajr', next, now, timings)).toBe('past')
    expect(getPrayerPhase('Dhuhr', next, now, timings)).toBe('past')
    expect(getPrayerPhase('Asr', next, now, timings)).toBe('next')
    expect(getPrayerPhase('Isha', next, now, timings)).toBe('later')
  })
})
