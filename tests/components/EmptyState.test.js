import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/EmptyState.vue'

describe('EmptyState', () => {
  it('renders the empty-results message', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.text()).toContain('لا توجد نتائج مطابقة لعملية البحث')
  })
})
