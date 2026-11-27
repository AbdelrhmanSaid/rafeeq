import { onBeforeUnmount, watchEffect } from 'vue'
import { useThemeStore } from '@/app/stores/theme'
import { useQuranStore } from '@/features/quran/store'

// The chosen background takes over the whole screen while the reader is open, then hands back the app's theme.
export function useReaderBackground() {
  const theme = useThemeStore()
  const quranStore = useQuranStore()

  const stop = watchEffect(() => {
    const { mode, color } = quranStore.readerBackgroundOption
    theme.setPageOverrides({ mode, bg: color })
  })

  onBeforeUnmount(() => {
    stop()
    theme.clearPageOverrides()
  })
}
