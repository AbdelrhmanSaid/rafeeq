import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCurrentPrayerKey } from './useCurrentPrayerKey'

const originalTz = process.env.TZ

beforeEach(() => {
  process.env.TZ = 'Africa/Cairo'
  localStorage.setItem('latitude', '30.0444')
  localStorage.setItem('longitude', '31.2357')
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  process.env.TZ = originalTz
})

describe('useCurrentPrayerKey', () => {
  it('is the prayer whose time has most recently started', () => {
    vi.useFakeTimers({ now: new Date('2026-11-26T11:00:00Z') })

    expect(useCurrentPrayerKey().value).toBe('Dhuhr')
  })

  it("is still the previous night's Isha before Fajr", () => {
    vi.useFakeTimers({ now: new Date('2026-11-26T00:00:00Z') })

    expect(useCurrentPrayerKey().value).toBe('Isha')
  })

  it('is null without a saved location', () => {
    localStorage.clear()
    setActivePinia(createPinia())

    expect(useCurrentPrayerKey().value).toBeNull()
  })
})
