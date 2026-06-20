import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Logo from './Logo.vue'

describe('Logo', () => {
  it('renders an svg with the brand viewBox', () => {
    const wrapper = mount(Logo)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.element.getAttribute('viewBox')).toBe('0 0 404 207')
  })

  it('scales height to the size prop', () => {
    expect(mount(Logo).find('svg').attributes('height')).toBe('42')
    expect(
      mount(Logo, { props: { size: 100 } })
        .find('svg')
        .attributes('height'),
    ).toBe('100')
  })
})
