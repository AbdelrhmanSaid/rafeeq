import { onMounted, onUnmounted } from 'vue'
import { useWakeLock } from '@vueuse/core'

// Keeps the screen on for the lifetime of the calling view — used by reading
// surfaces (surah, azkar) where the reader lingers without touching the screen.
export function useScreenWakeLock() {
  const wakeLock = useWakeLock()

  onMounted(() => {
    if (wakeLock.isSupported.value) wakeLock.request('screen').catch(() => {})
  })
  onUnmounted(() => wakeLock.release().catch(() => {}))
}
