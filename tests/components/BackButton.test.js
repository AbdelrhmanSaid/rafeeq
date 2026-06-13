import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { RouterLinkStub } from '@vue/test-utils'
import BackButton from '@/components/BackButton.vue'

const mountWith = (props) =>
  mount(BackButton, {
    props,
    global: { stubs: { RouterLink: RouterLinkStub } },
  })

describe('BackButton', () => {
  it('renders the default label', () => {
    const wrapper = mountWith({ to: '/' })
    expect(wrapper.text()).toContain('العودة')
  })

  it('renders a custom label', () => {
    const wrapper = mountWith({ to: '/quran', label: 'القرآن' })
    expect(wrapper.text()).toContain('القرآن')
  })

  it('passes the destination to the router link', () => {
    const wrapper = mountWith({ to: { name: 'home' } })
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toEqual({ name: 'home' })
  })

  it('applies the embed-hidden class by default', () => {
    const wrapper = mountWith({ to: '/' })
    expect(wrapper.classes()).toContain('embed-hidden')
  })

  it('omits the embed-hidden class when disabled', () => {
    const wrapper = mountWith({ to: '/', embedHidden: false })
    expect(wrapper.classes()).not.toContain('embed-hidden')
  })
})
