import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrayerTimes from './PrayerTimes.vue'

const originalTz = process.env.TZ

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.useRealTimers()
  process.env.TZ = originalTz
})

describe('PrayerTimes', () => {
  it('shows times for the local day just after midnight', () => {
    process.env.TZ = 'Asia/Riyadh'
    // 00:30 on Thursday, 18 Jumada al-Ula in Riyadh, while UTC is still on Wednesday.
    vi.useFakeTimers({ now: new Date('2026-10-28T21:30:00Z') })

    const wrapper = mount(PrayerTimes, { props: { lat: 21.4225, long: 39.8262 } })

    expect(wrapper.text()).toContain('الخميس')
    expect(wrapper.text()).toContain('١٨ جمادى الأولى ١٤٤٨')
    expect(wrapper.text()).toContain('الفجر')
  })

  it('works without a network connection', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'))

    const wrapper = mount(PrayerTimes, { props: { lat: 30.0444, long: 31.2357 } })

    expect(fetch).not.toHaveBeenCalled()
    expect(wrapper.findAll('.prayer-card, .prayer-row')).toHaveLength(6)
  })
})
