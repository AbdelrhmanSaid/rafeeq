import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OptionsSheet from './OptionsSheet.vue'

const BottomSheet = { props: ['show'], template: '<div v-if="show"><slot /></div>' }

const many = Array.from({ length: 12 }, (_, index) => ({ value: index, label: `خيار ${index}` }))
many[4] = { value: 4, label: 'عبد الباسط' }

function mountSheet(props = {}) {
  return mount(OptionsSheet, {
    props: { show: true, title: 'القارئ', options: many, modelValue: 4, ...props },
    global: { stubs: { BottomSheet } },
    attachTo: document.body,
  })
}

describe('OptionsSheet', () => {
  it('gives a short list no search field', () => {
    const wrapper = mountSheet({ options: many.slice(0, 3), modelValue: 0 })

    expect(wrapper.find('input').exists()).toBe(false)
    wrapper.unmount()
  })

  it('searches a long list, ignoring spaces in names', async () => {
    const wrapper = mountSheet()

    await wrapper.find('input').setValue('عبدالباسط')

    expect(wrapper.findAll('[role="radio"]').map((option) => option.text())).toEqual(['عبد الباسط'])
    wrapper.unmount()
  })

  it('makes the list one Tab stop, on the chosen option, and moves with the arrows without choosing', async () => {
    const wrapper = mountSheet()
    const options = () => wrapper.findAll('[role="radio"]')

    expect(
      options()
        .filter((option) => option.attributes('tabindex') === '0')
        .map((o) => o.text()),
    ).toEqual(['عبد الباسط'])

    await wrapper.find('[role="radiogroup"]').trigger('keydown', { key: 'ArrowDown' })

    expect(options()[5].attributes('tabindex')).toBe('0')
    expect(document.activeElement).toBe(options()[5].element)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('chooses an option and asks to close', async () => {
    const wrapper = mountSheet()

    await wrapper.findAll('[role="radio"]')[7].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[7]])
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})
