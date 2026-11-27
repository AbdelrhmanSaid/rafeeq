import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import QuranPlayerPill from '@/features/quran/components/QuranPlayerPill.vue'
import { useQuranStore } from '@/features/quran/store'

const BottomSheet = { props: ['show'], template: '<div v-if="show"><slot /></div>' }

async function openSheet() {
  setActivePinia(createPinia())
  const wrapper = mount(QuranPlayerPill, { global: { stubs: { BottomSheet } }, attachTo: document.body })
  await wrapper.find('.player-pill__reciter').trigger('click')
  return wrapper
}

describe('QuranPlayerPill', () => {
  it('makes the reciter list one Tab stop, on the chosen reciter', async () => {
    const wrapper = await openSheet()
    const options = wrapper.findAll('[role="radio"]')
    const stops = options.filter((option) => option.attributes('tabindex') === '0')

    expect(stops).toHaveLength(1)
    expect(stops[0].attributes('aria-checked')).toBe('true')
    wrapper.unmount()
  })

  it('shows a mujawwad recording as such beside the name', async () => {
    setActivePinia(createPinia())
    useQuranStore().currentReciter = 51
    const wrapper = mount(QuranPlayerPill, { global: { stubs: { BottomSheet } } })

    expect(wrapper.find('.player-pill__style').text()).toBe('مجوّد')
    wrapper.unmount()
  })
})
