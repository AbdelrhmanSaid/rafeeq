import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), promise: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast }))
// Avoid pulling html2canvas into the component test.
vi.mock('@/utilities/export', () => ({ exportComponent: vi.fn().mockResolvedValue(true) }))

import ZekrCard from '@/components/ZekrCard.vue'

const mountCard = (props = {}) => mount(ZekrCard, { props: { text: 'سبحان الله', repeat: 3, ...props } })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ZekrCard', () => {
  it('renders the zekr text', () => {
    const wrapper = mountCard()
    expect(wrapper.get('.zekr-text').text()).toBe('سبحان الله')
  })

  it('renders reference and benefit when provided', () => {
    const wrapper = mountCard({ reference: 'البخاري', benefit: 'فضل عظيم' })
    const text = wrapper.text()
    expect(text).toContain('البخاري')
    expect(text).toContain('فضل عظيم')
  })

  it('shows the counter as an Arabic-numeral fraction', () => {
    const wrapper = mountCard({ repeat: 3 })
    expect(wrapper.get('.btn-counter').attributes('data-content')).toBe('٠/٣')
  })

  it('increments and emits on counter clicks, capping at repeat', async () => {
    const wrapper = mountCard({ repeat: 2 })
    const counter = wrapper.get('.btn-counter')

    await counter.trigger('click')
    await counter.trigger('click')
    await counter.trigger('click') // exceeds repeat -> ignored

    expect(counter.attributes('data-content')).toBe('٢/٢')
    expect(wrapper.emitted('increment')).toHaveLength(2)
  })

  it('reset is disabled at zero and emits the count when reset', async () => {
    const wrapper = mountCard({ repeat: 3 })
    const resetButton = wrapper.findAll('.dropdown-item').find((b) => b.text().includes('تصفير'))

    expect(resetButton.attributes('disabled')).toBeDefined()

    await wrapper.get('.btn-counter').trigger('click')
    await wrapper.get('.btn-counter').trigger('click')
    await resetButton.trigger('click')

    expect(wrapper.emitted('reset')).toBeTruthy()
    expect(wrapper.emitted('reset')[0]).toEqual([2])
    expect(wrapper.get('.btn-counter').attributes('data-content')).toBe('٠/٣')
  })

  it('copies the zekr text through the toast promise helper', async () => {
    const wrapper = mountCard()
    const copyButton = wrapper.findAll('.dropdown-item').find((b) => b.text().includes('نسخ'))

    await copyButton.trigger('click')
    expect(toast.promise).toHaveBeenCalled()
  })
})
