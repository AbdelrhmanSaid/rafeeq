import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Sebha from '@/components/Sebha.vue'

describe('Sebha', () => {
  it('starts the counter at zero (Arabic numeral)', () => {
    const wrapper = mount(Sebha)
    expect(wrapper.get('.sebha-count').text()).toBe('٠')
  })

  it('increments the counter on each press', async () => {
    const wrapper = mount(Sebha)
    const button = wrapper.get('.sebha-btn')

    await button.trigger('click')
    expect(wrapper.get('.sebha-count').text()).toBe('١')

    await button.trigger('click')
    await button.trigger('click')
    expect(wrapper.get('.sebha-count').text()).toBe('٣')
  })

  it('resets the counter to zero', async () => {
    const wrapper = mount(Sebha)
    await wrapper.get('.sebha-btn').trigger('click')
    await wrapper.get('.sebha-actions button').trigger('click')
    expect(wrapper.get('.sebha-count').text()).toBe('٠')
  })
})
