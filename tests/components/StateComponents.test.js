import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ErrorState from '@/components/ErrorState.vue'
import LoadingState from '@/components/LoadingState.vue'
import OfflineState from '@/components/OfflineState.vue'

describe('ErrorState', () => {
  it('shows the default error message', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.text()).toContain('حدث خطأ، برجاء المحاولة في وقت لاحق.')
  })

  it('renders a custom message', () => {
    const wrapper = mount(ErrorState, { props: { message: 'خطأ مخصص' } })
    expect(wrapper.text()).toContain('خطأ مخصص')
  })

  it('renders the error code as an Arabic numeral', () => {
    const wrapper = mount(ErrorState, { props: { code: 404 } })
    expect(wrapper.get('.display-1').text()).toBe('٤٠٤')
  })

  it('omits the code heading when no code is given', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.find('.display-1').exists()).toBe(false)
  })

  it('renders a provided icon component', () => {
    const Icon = { render: () => h('i', { class: 'my-icon' }) }
    const wrapper = mount(ErrorState, { props: { icon: Icon } })
    expect(wrapper.find('.my-icon').exists()).toBe(true)
  })
})

describe('LoadingState', () => {
  it('renders a spinner and the default loading message', () => {
    const wrapper = mount(LoadingState)
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.get('.lead').text()).toBe('جاري التحميل...')
  })

  it('renders a custom loading message', () => {
    const wrapper = mount(LoadingState, { props: { message: 'تحميل السورة' } })
    expect(wrapper.get('.lead').text()).toBe('تحميل السورة')
  })
})

describe('OfflineState', () => {
  it('renders the offline message', () => {
    const wrapper = mount(OfflineState)
    expect(wrapper.text()).toContain('لا يوجد اتصال بالإنترنت')
  })
})
