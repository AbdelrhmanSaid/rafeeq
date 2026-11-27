import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MushafPage from '@/features/quran/components/MushafPage.vue'

const page = JSON.parse(readFileSync(resolve(process.cwd(), 'public/data/mushaf/3.json'), 'utf8'))

vi.mock('@/features/quran/lib/mushafStorage', () => ({
  loadPage: vi.fn(async () => ({ data: page, fontFamily: 'p3' })),
}))

const pointer = (target, type, { id = 1, x = 100, y = 100, kind = 'touch', primary = true } = {}) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: id,
      pointerType: kind,
      isPrimary: primary,
      clientX: x,
      clientY: y,
    }),
  )

describe('MushafPage', () => {
  let wrapper
  let ayah

  beforeEach(async () => {
    vi.useFakeTimers()
    wrapper = mount(MushafPage, { props: { page: 3 }, attachTo: document.body })
    await flushPromises()
    ayah = wrapper.find('[data-key]').element
  })

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('selects an ayah held still', () => {
    pointer(ayah, 'pointerdown')
    vi.advanceTimersByTime(500)

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')[0][0]).toMatchObject({ key: ayah.dataset.key, pointer: true })
  })

  // The pager captures the pointer once a drag starts, so the moves and the release reach the window, not the page.
  it('drops the hold when the finger drags the page, even with the pointer captured elsewhere', () => {
    pointer(ayah, 'pointerdown')
    pointer(document.body, 'pointermove', { x: 140 })
    vi.advanceTimersByTime(500)

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('drops the hold when the finger lifts outside the page', () => {
    pointer(ayah, 'pointerdown')
    pointer(document.body, 'pointerup')
    vi.advanceTimersByTime(500)

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('drops the hold when a second finger comes down', () => {
    pointer(ayah, 'pointerdown')
    pointer(ayah, 'pointerdown', { id: 2, primary: false })
    vi.advanceTimersByTime(500)

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('leaves selection by touch to the hold, not the long-press menu', () => {
    pointer(ayah, 'pointerdown')
    pointer(document.body, 'pointermove', { x: 140 })
    ayah.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('selects an ayah on a right-click', () => {
    pointer(ayah, 'pointerdown', { kind: 'mouse' })
    const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    ayah.dispatchEvent(menu)

    expect(menu.defaultPrevented).toBe(true)
    expect(wrapper.emitted('select')[0][0]).toMatchObject({ key: ayah.dataset.key, pointer: true })
  })
})

describe('MushafPage, not downloaded', () => {
  it('still says which page it is, with its surah and juz', async () => {
    const { loadPage } = await import('@/features/quran/lib/mushafStorage')
    loadPage.mockRejectedValueOnce(new Error('offline'))
    const wrapper = mount(MushafPage, { props: { page: 293 } })
    await flushPromises()

    const where = wrapper.find('.mushaf-page__where').text()
    expect(where).toContain('صفحة ٢٩٣')
    expect(where).toContain('الإسراء')
    expect(where).toContain('الجزء ١٥')
    wrapper.unmount()
  })
})

describe('MushafPage, loaded', () => {
  it('names the surah and juz in its header without landmarks or vowel marks', async () => {
    const wrapper = mount(MushafPage, { props: { page: 3 } })
    await flushPromises()

    expect(wrapper.find('header').exists()).toBe(false)
    expect(wrapper.find('footer').exists()).toBe(false)
    expect(wrapper.find('.mushaf-sheet__meta').text()).toContain('البقرة')
    wrapper.unmount()
  })
})
