import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import SelectRow from './SelectRow.vue'

const isPhone = ref(true)
vi.mock('@/shared/composables/useIsMobile', () => ({ useIsMobile: () => isPhone }))

const BottomSheet = { props: ['show'], template: '<div v-if="show" class="sheet-stub"><slot /></div>' }

const options = [
  { value: '', label: 'تلقائي' },
  { value: 3, label: 'رابطة العالم الإسلامي' },
  { value: 5, label: 'الهيئة المصرية العامة للمساحة' },
]

let wrapper
function mountRow(props = {}) {
  wrapper = mount(SelectRow, {
    props: { label: 'طريقة الحساب', options, modelValue: '', ...props },
    global: { stubs: { BottomSheet } },
    attachTo: document.body,
  })
  return wrapper
}

// The dropdown is teleported to <body>.
const radios = () => [...document.querySelectorAll('[role="radio"]')]
const menu = () => document.querySelector('.options-menu')

afterEach(() => {
  wrapper?.unmount()
  isPhone.value = true
})

describe('SelectRow', () => {
  it('shows the chosen option, matching a stored string to a numeric value', () => {
    mountRow({ modelValue: '5' })

    expect(wrapper.find('.select-row__value').text()).toBe('الهيئة المصرية العامة للمساحة')
  })

  describe('on a phone', () => {
    it('opens the choices in a sheet, chooses with the option’s own value, and closes', async () => {
      mountRow({ modelValue: 3 })

      await wrapper.find('.select-row__button').trigger('click')

      expect(wrapper.find('.sheet-stub').exists()).toBe(true)
      expect(wrapper.find('[aria-checked="true"]').text()).toBe('رابطة العالم الإسلامي')

      await wrapper.findAll('[role="radio"]')[2].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([[5]])
      expect(wrapper.find('.sheet-stub').exists()).toBe(false)
    })
  })

  describe('on desktop', () => {
    it('opens a dropdown on the chosen option, and chooses from it', async () => {
      isPhone.value = false
      mountRow({ modelValue: 3 })

      await wrapper.find('.select-row__button').trigger('click')

      expect(wrapper.find('.sheet-stub').exists()).toBe(false)
      expect(menu()).not.toBe(null)
      expect(wrapper.find('.select-row__button').attributes('aria-expanded')).toBe('true')
      expect(document.activeElement).toBe(radios()[1])

      radios()[2].click()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toEqual([[5]])
      expect(menu()).toBe(null)
      expect(document.activeElement).toBe(wrapper.find('.select-row__button').element)
    })

    it('closes on Escape without letting a sheet around it close too', async () => {
      isPhone.value = false
      mountRow()
      const onDocumentKeydown = vi.fn()
      document.addEventListener('keydown', onDocumentKeydown)

      await wrapper.find('.select-row__button').trigger('click')
      radios()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await wrapper.vm.$nextTick()

      expect(menu()).toBe(null)
      expect(onDocumentKeydown).not.toHaveBeenCalled()
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      document.removeEventListener('keydown', onDocumentKeydown)
    })

    it('closes on a click outside', async () => {
      isPhone.value = false
      mountRow()

      await wrapper.find('.select-row__button').trigger('click')
      // onClickOutside skips a click in the same task as the one before it (the one that opened the menu).
      await new Promise((resolve) => setTimeout(resolve))
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await wrapper.vm.$nextTick()

      expect(menu()).toBe(null)
    })
  })
})
