import { onScopeDispose, ref, toValue, watch } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'

// Horizontal mushaf pages share one flex row, so the container is sized to the visible page only.
export function useMushafPager(container, { enabled, pages }) {
  const activeIndex = ref(0)

  const pageEls = () => Array.from(container.value?.children ?? [])

  // RTL scrollLeft runs negative, so page offsets follow the text direction.
  const direction = (el) => (getComputedStyle(el).direction === 'rtl' ? -1 : 1)

  function syncHeight() {
    const el = container.value
    if (!el) return

    const page = toValue(enabled) && pageEls()[activeIndex.value]
    el.style.height = page ? `${page.offsetHeight}px` : ''
  }

  function settle() {
    const el = container.value
    if (!el || !toValue(enabled) || !el.clientWidth) return

    const index = Math.round(Math.abs(el.scrollLeft) / el.clientWidth)
    if (index === activeIndex.value) return

    activeIndex.value = index
    syncHeight()

    // A turned page reads from its top, not from where the previous page was left.
    const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    if (el.getBoundingClientRect().top < offset) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function goToPage(index, behavior = 'smooth') {
    const el = container.value
    if (!el || index < 0) return
    el.scrollTo({ left: direction(el) * index * el.clientWidth, behavior })
  }

  // Snapping keeps emitting scroll events, so this runs once the page has settled.
  useEventListener(container, 'scroll', useDebounceFn(settle, 120), { passive: true })

  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => syncHeight())

  watch(
    [container, () => toValue(enabled), () => toValue(pages)],
    () => {
      activeIndex.value = 0
      if (container.value) container.value.scrollLeft = 0

      observer?.disconnect()
      if (toValue(enabled)) pageEls().forEach((page) => observer?.observe(page))
      syncHeight()
    },
    { flush: 'post', immediate: true },
  )

  onScopeDispose(() => observer?.disconnect())

  return { activeIndex, goToPage }
}
