import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ZekrCard from '@/features/azkar/components/ZekrCard.vue'

// Counting happens via the counter button on desktop viewports.
vi.mock('@/shared/composables/useIsMobile', () => ({ useIsMobile: () => ({ value: false }) }))

const vibrateOnFinish = vi.fn()
const scrollToNextZekr = vi.fn()

vi.mock('@/features/azkar/composables/useZekrVibration', () => ({
  useZekrVibration: () => ({ vibrateOnFinish }),
}))
vi.mock('@/features/azkar/composables/useZekrScroll', () => ({
  useZekrScroll: () => ({ scrollToNextZekr }),
}))

// Mirror how AzkarCategoryView binds the count via `v-model:count="counts[index]"`
// against a reactive object so the test exercises the real model write-back path.
const mountCard = (repeat) => {
  const counts = reactive({})
  const wrapper = mount(ZekrCard, {
    props: {
      text: 'ذكر',
      repeat,
      count: counts[0] ?? 0,
      'onUpdate:count': (value) => {
        counts[0] = value
        wrapper.setProps({ count: value })
      },
    },
  })
  return { wrapper, counts }
}

const clickCounter = (wrapper) => wrapper.find('.btn-counter').trigger('click')

describe('ZekrCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vibrateOnFinish.mockClear()
    scrollToNextZekr.mockClear()
  })

  it('vibrates and scrolls to the next zekr once the count reaches repeat (repeat=1)', async () => {
    const { wrapper, counts } = mountCard(1)

    await clickCounter(wrapper)

    expect(counts[0]).toBe(1)
    expect(vibrateOnFinish).toHaveBeenCalledTimes(1)
    expect(scrollToNextZekr).toHaveBeenCalledTimes(1)
  })

  it('only fires the completion behavior on the final increment (repeat=3)', async () => {
    const { wrapper, counts } = mountCard(3)

    await clickCounter(wrapper)
    await clickCounter(wrapper)
    expect(vibrateOnFinish).not.toHaveBeenCalled()
    expect(scrollToNextZekr).not.toHaveBeenCalled()

    await clickCounter(wrapper)

    expect(counts[0]).toBe(3)
    expect(vibrateOnFinish).toHaveBeenCalledTimes(1)
    expect(scrollToNextZekr).toHaveBeenCalledTimes(1)
  })

  it('does not count or re-fire past the required repeat', async () => {
    const { wrapper, counts } = mountCard(2)

    await clickCounter(wrapper)
    await clickCounter(wrapper)
    await clickCounter(wrapper)

    expect(counts[0]).toBe(2)
    expect(vibrateOnFinish).toHaveBeenCalledTimes(1)
    expect(scrollToNextZekr).toHaveBeenCalledTimes(1)
  })
})
