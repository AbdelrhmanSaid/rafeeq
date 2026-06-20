import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PrayerIcon from './PrayerIcon.vue'
import { prayerIcons } from './prayerIcons'

describe('PrayerIcon', () => {
  it('renders an svg with the matching viewBox for every known prayer', () => {
    for (const [name, data] of Object.entries(prayerIcons)) {
      const svg = mount(PrayerIcon, { props: { name } }).find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.element.getAttribute('viewBox')).toBe(data.viewBox)
    }
  })

  it('renders nothing for an unknown prayer name', () => {
    expect(
      mount(PrayerIcon, { props: { name: 'nope' } })
        .find('svg')
        .exists(),
    ).toBe(false)
  })
})
