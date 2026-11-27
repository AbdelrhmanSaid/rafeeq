import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ZekrCard from '@/features/azkar/components/ZekrCard.vue'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), promise: vi.fn((fn) => fn()) }))
vi.mock('vue-sonner', () => ({ toast }))

// A real ref: a plain { value } object isn't unwrapped in the template and would read as truthy (phone layout).
vi.mock('@/shared/composables/useIsMobile', async () => {
  const { ref } = await import('vue')
  return { useIsMobile: () => ref(false) }
})

const vibrateOnFinish = vi.fn()
const scrollToNextZekr = vi.fn()

vi.mock('@/features/azkar/composables/useZekrVibration', () => ({
  useZekrVibration: () => ({ vibrateOnFinish }),
}))
vi.mock('@/features/azkar/composables/useZekrScroll', () => ({
  useZekrScroll: () => ({ scrollToNextZekr }),
}))

const mountCard = (repeat) => {
  const counts = reactive({})
  const wrapper = mount(ZekrCard, {
    props: {
      'text': 'ذكر',
      repeat,
      'count': counts[0] ?? 0,
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
    Object.values(toast).forEach((fn) => fn.mockClear())
    vi.unstubAllGlobals()
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

  it('keeps reset outside the actions dropdown and disabled at zero', () => {
    const { wrapper } = mountCard(3)
    const resetBtn = wrapper.find('[aria-label="تصفير"]')

    expect(resetBtn.exists()).toBe(true)
    expect(resetBtn.element.closest('.dropdown-menu')).toBeNull()
    expect(resetBtn.attributes('disabled')).toBeDefined()
    expect(
      wrapper
        .findAll('.dropdown-item')
        .map((item) => item.text())
        .join(),
    ).not.toContain('تصفير')
  })

  it('marks the card as completed once the count reaches repeat', async () => {
    const { wrapper } = mountCard(2)

    expect(wrapper.classes()).not.toContain('completed')

    await clickCounter(wrapper)
    expect(wrapper.classes()).not.toContain('completed')

    await clickCounter(wrapper)
    expect(wrapper.classes()).toContain('completed')

    await wrapper.find('[aria-label="تصفير"]').trigger('click')
    expect(wrapper.classes()).not.toContain('completed')
  })

  it('resets the count from the standalone reset button', async () => {
    const { wrapper, counts } = mountCard(3)

    await clickCounter(wrapper)
    await clickCounter(wrapper)
    expect(counts[0]).toBe(2)

    const resetBtn = wrapper.find('[aria-label="تصفير"]')
    expect(resetBtn.attributes('disabled')).toBeUndefined()
    await resetBtn.trigger('click')

    expect(counts[0]).toBe(0)
  })

  it('counts a click anywhere on the card, even on desktop', async () => {
    const { wrapper, counts } = mountCard(3)

    await wrapper.find('.zekr-text').trigger('click')

    expect(counts[0]).toBe(1)
  })

  it('still counts a tap while text is selected elsewhere on the page', async () => {
    const { wrapper, counts } = mountCard(3)
    const elsewhere = document.createElement('p')
    elsewhere.textContent = 'نص محدد'
    document.body.appendChild(elsewhere)
    window.getSelection().selectAllChildren(elsewhere)

    await wrapper.find('.zekr-text').trigger('click')

    expect(counts[0]).toBe(1)
    elsewhere.remove()
  })

  it('does not count a click on the card actions, and lets it bubble so the dropdown can close', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: vi.fn().mockResolvedValue() } })
    const { wrapper, counts } = mountCard(3)
    const onDocumentClick = vi.fn()
    document.addEventListener('click', onDocumentClick)
    document.body.appendChild(wrapper.element)

    await wrapper.findAll('.dropdown-item')[2].trigger('click')

    expect(counts[0] ?? 0).toBe(0)
    expect(onDocumentClick).toHaveBeenCalled()
    document.removeEventListener('click', onDocumentClick)
  })

  it('shows no error when the share sheet is dismissed', async () => {
    const abort = Object.assign(new Error('Share canceled'), { name: 'AbortError' })
    vi.stubGlobal('navigator', { ...navigator, share: vi.fn().mockRejectedValue(abort) })
    const { wrapper } = mountCard(1)

    await wrapper.findAll('.dropdown-item')[1].trigger('click')
    await new Promise((resolve) => setTimeout(resolve))

    expect(toast.error).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('still reports a share that really fails', async () => {
    vi.stubGlobal('navigator', { ...navigator, share: vi.fn().mockRejectedValue(new Error('boom')) })
    const { wrapper } = mountCard(1)

    await wrapper.findAll('.dropdown-item')[1].trigger('click')
    await new Promise((resolve) => setTimeout(resolve))

    expect(toast.error).toHaveBeenCalledTimes(1)
  })

  it('copies the zekr when sharing is not available, and says it was copied', async () => {
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { ...navigator, share: undefined, clipboard: { writeText } })
    const { wrapper } = mountCard(1)

    await wrapper.findAll('.dropdown-item')[1].trigger('click')

    expect(writeText).toHaveBeenCalledWith('ذكر')
    expect(toast.promise.mock.calls[0][1].success).toBe('تم نسخ الذكر بنجاح')
  })
})
