import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

vi.mock('@/shared/composables/useIsMobile', () => ({ useIsMobile: () => ref(true) }))

const wrappers = []

const mountSheet = (props = {}) => {
  const wrapper = mount(BottomSheet, {
    props: { show: true, title: 'المزيد', ...props },
    slots: { default: '<button class="inside">عنصر</button>' },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

const touch = (target, type, clientY, timeStamp) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const point = { clientY }
  Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [point] })
  Object.defineProperty(event, 'timeStamp', { value: timeStamp })
  target.dispatchEvent(event)
  return event
}

describe('BottomSheet', () => {
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
    document.body.innerHTML = ''
  })

  it('renders a labelled modal dialog', () => {
    mountSheet()
    const dialog = document.querySelector('[role="dialog"]')

    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent).toBe('المزيد')
  })

  it('lets content that is scrolled down keep the gesture', async () => {
    const wrapper = mountSheet()
    await nextTick()
    const body = document.querySelector('.sheet-body')
    Object.defineProperty(body, 'scrollHeight', { value: 1000 })
    Object.defineProperty(body, 'clientHeight', { value: 300 })
    // Component styles are not loaded in jsdom, so mark the body as a scroller inline.
    body.style.overflowY = 'auto'
    body.scrollTop = 200

    touch(body, 'touchstart', 100, 0)
    const move = touch(body, 'touchmove', 300, 100)
    touch(body, 'touchend', 300, 100)

    expect(move.defaultPrevented).toBe(false)
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('closes on Escape', async () => {
    const wrapper = mountSheet()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('closes only the topmost sheet on Escape', async () => {
    const below = mountSheet()
    const above = mountSheet()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(above.emitted('close')).toHaveLength(1)
    expect(below.emitted('close')).toBeUndefined()
  })

  it('closes when the backdrop is tapped', async () => {
    const wrapper = mountSheet()

    document.querySelector('.sheet-scrim').click()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('closes when dragged down past a quarter of its height', async () => {
    const wrapper = mountSheet()
    await nextTick()
    const panel = document.querySelector('.sheet')
    Object.defineProperty(panel, 'offsetHeight', { value: 400 })

    touch(panel, 'touchstart', 100, 0)
    const move = touch(panel, 'touchmove', 250, 1000)
    touch(panel, 'touchend', 250, 1000)

    expect(move.defaultPrevented).toBe(true)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('settles back after a short, slow drag', async () => {
    const wrapper = mountSheet()
    await nextTick()
    const panel = document.querySelector('.sheet')
    Object.defineProperty(panel, 'offsetHeight', { value: 400 })

    touch(panel, 'touchstart', 100, 0)
    touch(panel, 'touchmove', 140, 1000)
    expect(panel.style.translate).toMatch(/^0(px)? 40px$/)
    touch(panel, 'touchend', 140, 1000)

    expect(wrapper.emitted('close')).toBeUndefined()
    expect(panel.style.translate).toBe('')
  })

  it('locks page scroll while open', async () => {
    const wrapper = mountSheet()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ show: false })
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
