import { onBeforeUnmount, watchEffect } from 'vue'
import { useThemeStore } from '@/app/stores/theme'
import { useQuranStore } from '@/features/quran/store'

// The chosen look takes over the whole screen while the reader is open, then hands back the app's own.
export function useReaderBackground() {
  const theme = useThemeStore()
  const quranStore = useQuranStore()

  const stop = watchEffect(() => theme.setPageTheme(quranStore.readerBackgroundOption.value))

  onBeforeUnmount(() => {
    stop()
    theme.clearPageTheme()
  })
}
