import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Logo from '@/components/Logo.vue'

describe('Logo', () => {
  it('renders an svg with the default size', () => {
    const wrapper = mount(Logo)
    const svg = wrapper.get('svg')
    expect(svg.attributes('height')).toBe('42')
    // width preserves the logo aspect ratio (404/207)
    expect(Number(svg.attributes('width'))).toBeCloseTo((42 * 404) / 207)
  })

  it('scales width and height from the size prop', () => {
    const wrapper = mount(Logo, { props: { size: 100 } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('height')).toBe('100')
    expect(Number(svg.attributes('width'))).toBeCloseTo((100 * 404) / 207)
  })
})
