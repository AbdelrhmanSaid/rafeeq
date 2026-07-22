import { ref, watch, toValue } from 'vue'
import { useOnline } from '@vueuse/core'
import { loadPageFont, loadSurahNamesFont } from '../fonts/qcfFontCache'

// Loads the QCF page fonts for the given (reactive) list of mushaf pages.
// Pages load sequentially in reading order (a long surah can span dozens of
// ~60 KB fonts); prioritize() jumps specific pages to the front — the viewer
// calls it for the visible page. Glyph text is unreadable without its page
// font, so the UI gates rendering on isPageReady(page) and falls back to
// plain text for failedPages.
export function useQcfPageFonts(pages) {
  const online = useOnline()
  const readyPages = ref(new Set())
  const failedPages = ref(new Set())
  const surahNamesReady = ref(false)

  async function load(page) {
    if (readyPages.value.has(page)) return
    try {
      await loadPageFont(page)
      readyPages.value = new Set(readyPages.value).add(page)
      failedPages.value.delete(page)
    } catch {
      failedPages.value = new Set(failedPages.value).add(page)
    }
  }

  let runId = 0

  watch(
    () => toValue(pages),
    async (list) => {
      if (!list?.length) return
      const current = ++runId
      loadSurahNamesFont()
        .then(() => (surahNamesReady.value = true))
        .catch(() => {})

      for (const page of list) {
        if (runId !== current) return
        await load(page)
      }
      // Prefetch adjacent pages for cross-surah navigation.
      if (online.value) {
        loadPageFont(Math.max(1, list[0] - 1)).catch(() => {})
        loadPageFont(Math.min(604, list[list.length - 1] + 1)).catch(() => {})
      }
    },
    { immediate: true }
  )

  // Failed pages retry when connectivity returns.
  watch(online, (isOnline) => {
    if (!isOnline || failedPages.value.size === 0) return
    const retry = [...failedPages.value]
    failedPages.value = new Set()
    retry.forEach(load)
  })

  return {
    readyPages,
    failedPages,
    surahNamesReady,
    isPageReady: (page) => readyPages.value.has(page),
    prioritize: (list) => list.forEach(load),
  }
}
