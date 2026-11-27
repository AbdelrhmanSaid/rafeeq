import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import AyahSearchResults from './AyahSearchResults.vue'

const row = (key, page, segments, clipped = {}) => ({ key, title: `سورة ${key}`, page, segments, ...clipped })
const results = (overrides = {}) => ({
  isLoading: false,
  failed: false,
  exact: [],
  close: [],
  exactCount: 0,
  closeCount: 0,
  total: 0,
  hasMore: false,
  showMore: () => {},
  ...overrides,
})
const render = (overrides) =>
  mount(AyahSearchResults, {
    props: { results: results(overrides) },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })

describe('AyahSearchResults', () => {
  it('draws nothing when no ayah matches', () => {
    expect(render().html()).toBe('<!--v-if-->')
  })

  it('marks the matched words and links each ayah to its place in the Mushaf', () => {
    const wrapper = render({
      exact: [
        row('2:255', 42, [
          { text: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ', hit: false },
          { text: 'ٱلْحَىُّ ٱلْقَيُّومُ', hit: true },
        ]),
      ],
      exactCount: 1,
      total: 1,
    })

    expect(wrapper.find('.list-title').text()).toBe('الآيات١ آية')
    expect(wrapper.findAll('mark').map((mark) => mark.text())).toEqual(['ٱلْحَىُّ ٱلْقَيُّومُ'])
    expect(wrapper.find('.ayah-row__text').text()).toBe('ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ')
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toEqual({
      name: 'quran-page',
      params: { page: 42 },
      query: { ayah: '2:255' },
    })
  })

  it('shows where an ayah was cut short', () => {
    const wrapper = render({
      exact: [row('2:282', 48, [{ text: 'وَٱسْتَشْهِدُوا۟', hit: true }], { clippedStart: true, clippedEnd: true })],
      exactCount: 1,
      total: 1,
    })

    expect(wrapper.find('.ayah-row__text').text()).toBe('… وَٱسْتَشْهِدُوا۟ …')
  })

  it('lists close matches under a heading of their own', () => {
    const wrapper = render({
      exact: [row('94:5', 596, [{ text: 'أ', hit: true }])],
      close: [row('94:6', 596, [{ text: 'ب', hit: true }])],
      exactCount: 1,
      closeCount: 1,
      total: 2,
    })

    expect(wrapper.findAll('.list-title span').map((title) => title.text())).toEqual(['الآيات', 'نتائج مقاربة'])
  })

  it('offers the rest when there are more results than shown', async () => {
    let asked = 0
    const wrapper = render({
      exact: [row('1:1', 1, [{ text: 'أ', hit: true }])],
      exactCount: 80,
      total: 80,
      hasMore: true,
      showMore: () => asked++,
    })

    await wrapper.find('button').trigger('click')
    expect(asked).toBe(1)
  })

  it('says so while the text loads, and when it could not be loaded', () => {
    expect(render({ isLoading: true }).find('[role="status"]').text()).toContain('جاري')
    expect(render({ failed: true }).find('.ayah-results__note').text()).toContain('تعذّر')
  })
})
