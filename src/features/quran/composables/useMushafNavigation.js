import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Tracks which mushaf page is visible in a viewer and provides programmatic
// navigation. `horizontal` = the flip strip (container scrolling); otherwise
// the vertical stack (window scrolling). Page elements carry [data-page].
export function useMushafNavigation({ containerRef, horizontal = false }) {
  const visiblePage = ref(null)
  // Guards auto-navigation (deep links, follow-the-reciter) so it isn't
  // mistaken for a manual gesture by useMushafFollow.
  const isAutoNavigating = ref(false)

  let observer = null
  let autoNavTimer = null

  function observePages() {
    observer?.disconnect()
    const container = containerRef.value
    if (!container) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visiblePage.value = Number(entry.target.dataset.page)
        }
      },
      { root: horizontal ? container : null, threshold: 0.55 },
    )
    container.querySelectorAll('[data-page]').forEach((el) => observer.observe(el))
  }

  function endAutoNavigation() {
    clearTimeout(autoNavTimer)
    isAutoNavigating.value = false
  }

  function goToPage(page, { behavior = 'smooth', ayah = null } = {}) {
    const container = containerRef.value
    if (!container) return

    const pageEl = container.querySelector(`[data-page="${page}"]`)
    if (!pageEl) return
    // In the vertical stack an ayah target centers its exact line; the flip
    // strip always snaps whole pages.
    const target = (!horizontal && ayah != null && pageEl.querySelector(`[data-ayah="${ayah}"]`)) || pageEl

    clearTimeout(autoNavTimer)
    isAutoNavigating.value = true
    // scrollend has no Safari support — the timeout is the fallback (and the
    // only signal for behavior:'instant').
    autoNavTimer = setTimeout(endAutoNavigation, behavior === 'smooth' ? 900 : 150)

    target.scrollIntoView(horizontal ? { inline: 'center', block: 'nearest', behavior } : { block: 'center', behavior })
  }

  const scrollTarget = () => (horizontal ? containerRef.value : window)

  function onScrollEnd() {
    if (isAutoNavigating.value) endAutoNavigation()
  }

  onMounted(() => {
    nextTick(observePages)
    scrollTarget()?.addEventListener('scrollend', onScrollEnd)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    clearTimeout(autoNavTimer)
    scrollTarget()?.removeEventListener('scrollend', onScrollEnd)
  })

  return { visiblePage, isAutoNavigating, goToPage, observePages }
}
