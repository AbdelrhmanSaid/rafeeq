import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TafseerSheet from '@/features/quran/components/TafseerSheet.vue'

const ayah = (number) => ({ key: `2:${number}`, number: 7 + number, numberInSurah: number, text: `آية ${number}` })

// The sheet itself, without its animation and teleport.
const BottomSheet = { props: ['show'], template: '<div v-if="show"><slot /></div>' }

describe('TafseerSheet', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('keeps the last tafsir, dimmed, and the step buttons while the next one loads', async () => {
    let answer
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise((resolve) => (answer = resolve))),
    )
    const reply = (text) => answer(new Response(JSON.stringify({ data: [{ text }] }), { status: 200 }))
    setActivePinia(createPinia())
    const wrapper = mount(TafseerSheet, {
      props: { ayah: null, hasPrev: true, hasNext: true },
      global: { stubs: { BottomSheet } },
    })

    await wrapper.setProps({ ayah: ayah(1) })
    reply('تفسير الأولى')
    await flushPromises()
    expect(wrapper.find('.tafseer__text').text()).toBe('تفسير الأولى')

    await wrapper.setProps({ ayah: ayah(2) })
    await flushPromises()
    expect(wrapper.find('.tafseer__text').text()).toBe('تفسير الأولى')
    expect(wrapper.find('.tafseer__text').classes()).toContain('is-stale')
    expect(wrapper.findAll('.tafseer__nav button')).toHaveLength(2)

    reply('تفسير الثانية')
    await flushPromises()
    expect(wrapper.find('.tafseer__text').text()).toBe('تفسير الثانية')
    expect(wrapper.find('.tafseer__text').classes()).not.toContain('is-stale')
    wrapper.unmount()
  })
})
