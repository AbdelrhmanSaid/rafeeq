import { onScopeDispose, ref, toValue, watch } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'

const TURN_DURATION = 220

const easeOutCubic = (t) => 1 - (1 - t) ** 3

// Horizontal mushaf pages share one flex row, so the container is sized to the visible page only.
export function useMushafPager(container, { enabled, pages }) {
  const activeIndex = ref(0)
  let frame = 0

  const pageEls = () => Array.from(container.value?.children ?? [])

  // RTL scrollLeft runs negative, so page offsets follow the text direction.
  const direction = (el) => (getComputedStyle(el).direction === 'rtl' ? -1 : 1)

  const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  function syncHeight() {
    const el = container.value
    if (!el) return

    const page = toValue(enabled) && pageEls()[activeIndex.value]
    el.style.height = page ? `${page.offsetHeight}px` : ''
  }

  function setActive(index) {
    if (index === activeIndex.value) return
    activeIndex.value = index
    syncHeight()
  }

  function settle() {
    const el = container.value
    if (frame || !el || !toValue(enabled) || !el.clientWidth) return
    setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth))
  }

  function stopTurn() {
    cancelAnimationFrame(frame)
    frame = 0
    if (container.value) container.value.style.scrollSnapType = ''
  }

  // Browser smooth scrolling is slow and uneven, so page turns are animated by hand with snapping paused.
  function turnTo(el, left, animate) {
    stopTurn()

    if (!animate) {
      el.scrollLeft = left
      return
    }

    const from = el.scrollLeft
    const start = performance.now()
    el.style.scrollSnapType = 'none'

    const step = (now) => {
      const progress = Math.min((now - start) / TURN_DURATION, 1)
      el.scrollLeft = from + (left - from) * easeOutCubic(progress)

      if (progress < 1) frame = requestAnimationFrame(step)
      else stopTurn()
    }

    frame = requestAnimationFrame(step)
  }

  // Updates the active page up front so repeated steps queue instead of landing on the same page.
  function goToPage(index, { animate = true } = {}) {
    const el = container.value
    if (!el || index < 0 || index >= pageEls().length) return

    setActive(index)
    turnTo(el, direction(el) * index * el.clientWidth, animate && !prefersReducedMotion())
  }

  const next = () => goToPage(activeIndex.value + 1)
  const prev = () => goToPage(activeIndex.value - 1)

  // scrollend fires once the swipe has snapped; older browsers fall back to waiting for scroll events to stop.
  if (typeof window !== 'undefined' && 'onscrollend' in window) {
    useEventListener(container, 'scrollend', settle, { passive: true })
  } else {
    useEventListener(container, 'scroll', useDebounceFn(settle, 80), { passive: true })
  }

  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => syncHeight())

  watch(
    [container, () => toValue(enabled), () => toValue(pages)],
    () => {
      stopTurn()
      activeIndex.value = 0
      if (container.value) container.value.scrollLeft = 0

      observer?.disconnect()
      if (toValue(enabled)) pageEls().forEach((page) => observer?.observe(page))
      syncHeight()
    },
    { flush: 'post', immediate: true },
  )

  onScopeDispose(() => {
    stopTurn()
    observer?.disconnect()
  })

  return { activeIndex, goToPage, next, prev }
}
