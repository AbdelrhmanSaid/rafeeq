import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Sebha from './Sebha.vue'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

const tap = (wrapper) => wrapper.find('.sebha__tap').trigger('click')

describe('Sebha', () => {
  it('saves the count across visits', async () => {
    const wrapper = mount(Sebha)
    await tap(wrapper)
    await tap(wrapper)

    expect(mount(Sebha).find('.sebha__count').text()).toBe('٢')
  })

  it('fades the ring out slowly only when it starts over after the last bead', async () => {
    localStorage.setItem('sebha-count', '32')
    const wrapper = mount(Sebha)
    const ring = () => wrapper.find('.sebha__ring')

    await tap(wrapper)
    expect(ring().classes()).not.toContain('is-wrapping')
    expect(wrapper.findAll('.sebha__bead.is-lit')).toHaveLength(33)

    await tap(wrapper)
    expect(ring().classes()).toContain('is-wrapping')
    expect(wrapper.findAll('.sebha__bead.is-lit')).toHaveLength(1)

    vi.advanceTimersByTime(600)
    await wrapper.vm.$nextTick()
    expect(ring().classes()).not.toContain('is-wrapping')
  })
})
