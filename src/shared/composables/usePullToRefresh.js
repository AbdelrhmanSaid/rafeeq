import { computed, ref } from 'vue'
import { useEventListener } from '@vueuse/core'

// Custom pull-to-refresh for the standalone PWA (which has no browser chrome
// to refresh with). Engages only when the page is scrolled to the very top and
// the finger drags downward; the pull distance is dampened for a rubbery feel.
export function usePullToRefresh(onRefresh, { threshold = 70, max = 110 } = {}) {
  const pull = ref(0)
  const refreshing = ref(false)
  let startY = null
  let active = false

  useEventListener(
    window,
    'touchstart',
    (event) => {
      if (refreshing.value || window.scrollY > 0) return
      startY = event.touches[0].clientY
      active = true
    },
    { passive: true },
  )

  useEventListener(
    window,
    'touchmove',
    (event) => {
      if (!active || refreshing.value) return
      const dy = event.touches[0].clientY - startY
      if (dy <= 0 || window.scrollY > 0) {
        pull.value = 0
        return
      }
      // Claim the gesture from native scrolling/overscroll while pulling.
      if (event.cancelable) event.preventDefault()
      pull.value = Math.min(max, dy / 2.2)
    },
    { passive: false },
  )

  const end = async () => {
    if (!active) return
    active = false
    if (pull.value >= threshold) {
      refreshing.value = true
      // Hold the indicator in view while the refresh runs.
      pull.value = threshold * 0.8
      try {
        await onRefresh()
      } finally {
        refreshing.value = false
        pull.value = 0
      }
    } else {
      pull.value = 0
    }
  }

  useEventListener(window, 'touchend', end, { passive: true })
  useEventListener(window, 'touchcancel', end, { passive: true })

  const progress = computed(() => Math.min(1, pull.value / threshold))

  return { pull, refreshing, progress }
}
