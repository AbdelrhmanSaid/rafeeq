import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  const autoUpdateServiceWorker = useLocalStorage('auto-update-service-worker', true)
  const zekrVibrationEnabled = useLocalStorage('zekr-vibration-enabled', true)
  const zekrVibrationIntensity = useLocalStorage('zekr-vibration-intensity', 60)

  if (!Number.isFinite(zekrVibrationIntensity.value)) {
    zekrVibrationIntensity.value = 20
  }

  return {
    autoUpdateServiceWorker,
    zekrVibrationEnabled,
    zekrVibrationIntensity,
  }
})
