import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import SunnahPrayers from './SunnahPrayers.vue'

const currentPrayerKey = ref(null)

vi.mock('@/features/prayers/composables/useCurrentPrayerKey', () => ({
  useCurrentPrayerKey: () => currentPrayerKey,
}))

const rowNames = (wrapper) => wrapper.findAll('.sunnah-row').map((row) => row.find('.fw-semibold').text())

beforeEach(() => {
  currentPrayerKey.value = null
})

describe('SunnahPrayers', () => {
  it('shows only the current prayer until expanded', async () => {
    currentPrayerKey.value = 'Maghrib'
    const wrapper = mount(SunnahPrayers)

    expect(rowNames(wrapper)).toEqual(['المغرب'])

    await wrapper.find('.sunnah-toggle').trigger('click')

    expect(rowNames(wrapper)).toHaveLength(5)
    expect(wrapper.find('.sunnah-toggle').attributes('aria-expanded')).toBe('true')
  })

  it('shows Dhuhr in the time after sunrise', () => {
    currentPrayerKey.value = 'Sunrise'

    expect(rowNames(mount(SunnahPrayers))).toEqual(['الظهر'])
  })

  it('lists every prayer without a toggle when no location is set', () => {
    const wrapper = mount(SunnahPrayers)

    expect(rowNames(wrapper)).toHaveLength(5)
    expect(wrapper.find('.sunnah-toggle').exists()).toBe(false)
  })
})
