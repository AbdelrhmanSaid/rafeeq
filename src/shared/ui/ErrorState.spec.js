import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from './ErrorState.vue'

describe('ErrorState', () => {
  it('offers "try again" only when given a retry', async () => {
    expect(mount(ErrorState).find('button').exists()).toBe(false)

    const retry = vi.fn()
    const wrapper = mount(ErrorState, { props: { retry } })
    await wrapper.find('button').trigger('click')

    expect(retry).toHaveBeenCalledOnce()
  })
})
