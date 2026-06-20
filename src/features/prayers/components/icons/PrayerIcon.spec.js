import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrayerIcon from './PrayerIcon.vue'

describe('PrayerIcon', () => {
  it('resolves the icon from the name prop', () => {
    const fajr = mount(PrayerIcon, { props: { name: 'fajr' } })
    const isha = mount(PrayerIcon, { props: { name: 'isha' } })

    expect(fajr.find('svg').exists()).toBe(true)
    // Distinct names render distinct icons — proves the lookup is name-driven.
    expect(fajr.html()).not.toBe(isha.html())
  })

  it('renders nothing for an unknown name', () => {
    expect(
      mount(PrayerIcon, { props: { name: 'nope' } })
        .find('svg')
        .exists(),
    ).toBe(false)
  })
})
