import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FavoriteList from '@/components/FavoriteList.vue'

const items = [
  { id: 1, name: 'الفاتحة' },
  { id: 2, name: 'البقرة' },
]

const mountList = (props = {}) =>
  mount(FavoriteList, {
    props: { items, itemKey: 'id', favoritesKey: 'fav-list-test', ...props },
    slots: { default: '<span class="item-name">{{ params.item.name }}</span>' },
  })

beforeEach(() => {
  localStorage.clear()
})

describe('FavoriteList', () => {
  it('renders every item in the list', () => {
    const wrapper = mountList()
    const names = wrapper.findAll('.item-name').map((n) => n.text())
    expect(names).toContain('الفاتحة')
    expect(names).toContain('البقرة')
  })

  it('renders an empty state when there are no items', () => {
    const wrapper = mountList({ items: [] })
    expect(wrapper.text()).toContain('لا توجد نتائج مطابقة لعملية البحث')
  })

  it('does not show a favorites section until something is favorited', () => {
    const wrapper = mountList()
    // Only the "all items" list exists -> each item rendered once.
    expect(wrapper.findAll('.item-name')).toHaveLength(2)
  })

  it('promotes an item into the favorites section when toggled', async () => {
    const wrapper = mountList()
    // The per-row favorite buttons live in the "all items" list.
    const favButton = wrapper.findAll('button')[0]
    await favButton.trigger('click')
    await nextTick()

    // The favorited item now appears twice: in favorites + in the all list.
    const names = wrapper.findAll('.item-name').map((n) => n.text())
    expect(names.filter((n) => n === 'الفاتحة')).toHaveLength(2)
  })

  it('hides the favorites section while a search is active', async () => {
    const wrapper = mountList({ search: 'foo' })
    await wrapper.findAll('button')[0].trigger('click')
    await nextTick()
    // With a search term, favorites section is suppressed -> single render.
    const names = wrapper.findAll('.item-name').map((n) => n.text())
    expect(names.filter((n) => n === 'الفاتحة')).toHaveLength(1)
  })
})
