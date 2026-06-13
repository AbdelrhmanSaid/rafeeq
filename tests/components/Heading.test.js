import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast }))

import Heading from '@/components/Heading.vue'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Heading', () => {
  it('renders the title at the requested heading size', () => {
    const wrapper = mount(Heading, { props: { title: 'العنوان', size: 2 } })
    const heading = wrapper.get('.h2')
    expect(heading.text()).toContain('العنوان')
  })

  it('renders the subtitle when provided', () => {
    const wrapper = mount(Heading, { props: { title: 'ع', subtitle: 'وصف' } })
    expect(wrapper.get('.lead').text()).toBe('وصف')
  })

  it('omits the subtitle element when not provided', () => {
    const wrapper = mount(Heading, { props: { title: 'ع' } })
    expect(wrapper.find('.lead').exists()).toBe(false)
  })

  it('does not render a share button by default', () => {
    const wrapper = mount(Heading, { props: { title: 'ع' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('uses navigator.share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, share })

    const wrapper = mount(Heading, { props: { title: 'مشاركة', share: true } })
    await wrapper.get('button').trigger('click')

    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'مشاركة', text: 'مشاركة' }))
    vi.unstubAllGlobals()
  })

  it('falls back to clipboard copy and a toast when share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const wrapper = mount(Heading, { props: { title: 'نسخ', share: true } })
    await wrapper.get('button').trigger('click')
    await Promise.resolve()

    expect(writeText).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('تم نسخ الرابط')
    vi.unstubAllGlobals()
  })
})
