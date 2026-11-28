import { computed } from 'vue'
import { useQuranStore } from '@/features/quran/store'
import { paperOf, themeOf } from '@/shared/constants/themes'

// The chosen look paints the Mushaf page only, as attributes on its own element; the bars and sheets keep the app's.
export function useReaderBackground() {
  const quranStore = useQuranStore()

  return computed(() => {
    const look = quranStore.readerBackgroundOption.value
    const scheme = themeOf(look)?.scheme
    if (!scheme) return {}
    return { 'data-bs-theme': scheme, 'data-app-paper': paperOf(look) ?? undefined }
  })
}
