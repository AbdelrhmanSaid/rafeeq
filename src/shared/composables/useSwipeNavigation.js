import { useSwipe } from '@vueuse/core'

// Mushaf navigation uses physical gestures: right is next and left is previous.
export function useSwipeNavigation(target, { onNext, onPrev, minDistance = 70 } = {}) {
  const { lengthX, lengthY } = useSwipe(target, {
    passive: true,
    threshold: 30,
    onSwipeEnd() {
      const dx = -lengthX.value
      const dy = Math.abs(lengthY.value)

      if (Math.abs(dx) < minDistance || Math.abs(dx) < dy * 1.5) return

      if (dx > 0) onNext?.()
      else onPrev?.()
    },
  })
}
