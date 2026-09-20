import { onMounted, onUnmounted } from 'vue'
import { useWakeLock } from '@vueuse/core'

export function useScreenWakeLock() {
  const wakeLock = useWakeLock()

  onMounted(() => {
    if (wakeLock.isSupported.value) wakeLock.request('screen').catch(() => {})
  })
  onUnmounted(() => wakeLock.release().catch(() => {}))
}
