import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SelectRow from './SelectRow.vue'

const BottomSheet = { props: ['show'], template: '<div v-if="show"><slot /></div>' }

const options = [
  { value: '', label: 'تلقائي' },
  { value: 3, label: 'رابطة العالم الإسلامي' },
  { value: 5, label: 'الهيئة المصرية العامة للمساحة' },
]

function mountRow(props = {}) {
  return mount(SelectRow, {
    props: { label: 'طريقة الحساب', options, modelValue: '', ...props },
    global: { stubs: { BottomSheet } },
    attachTo: document.body,
  })
}

describe('SelectRow', () => {
  it('shows the chosen option and opens the choices on tap', async () => {
    const wrapper = mountRow({ modelValue: 3 })

    expect(wrapper.find('.select-row__value').text()).toBe('رابطة العالم الإسلامي')
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(0)

    await wrapper.find('.select-row').trigger('click')

    expect(wrapper.findAll('[role="radio"]')).toHaveLength(3)
    expect(wrapper.find('[aria-checked="true"]').text()).toBe('رابطة العالم الإسلامي')
    wrapper.unmount()
  })

  it('chooses an option with its own value and closes', async () => {
    const wrapper = mountRow()

    await wrapper.find('.select-row').trigger('click')
    await wrapper.findAll('[role="radio"]')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[5]])
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('matches a stored string to a numeric value', async () => {
    const wrapper = mountRow({ modelValue: '5' })

    expect(wrapper.find('.select-row__value').text()).toBe('الهيئة المصرية العامة للمساحة')
    wrapper.unmount()
  })
})
