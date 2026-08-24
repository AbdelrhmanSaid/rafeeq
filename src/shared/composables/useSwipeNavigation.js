import { useSwipe } from '@vueuse/core'

// Horizontal swipe → prev/next navigation for paged reading content.
//
// The mapping follows the physical mushaf in an RTL app: advancing means
// flipping the page toward you, i.e. the finger travels *rightward* for the
// next item and leftward for the previous one. Touch coordinates are physical,
// so this is deliberately not affected by the rtlcss build.
export function useSwipeNavigation(target, { onNext, onPrev, minDistance = 70 } = {}) {
  const { lengthX, lengthY } = useSwipe(target, {
    // Don't call preventDefault — vertical scrolling must keep working.
    passive: true,
    threshold: 30,
    onSwipeEnd() {
      const dx = -lengthX.value // positive = finger moved right
      const dy = Math.abs(lengthY.value)

      // Require a clearly horizontal gesture so sloppy scrolls don't navigate.
      if (Math.abs(dx) < minDistance || Math.abs(dx) < dy * 1.5) return

      if (dx > 0) onNext?.()
      else onPrev?.()
    },
  })
}
