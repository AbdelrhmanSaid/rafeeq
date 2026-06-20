import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const DEFAULT_ZEKR_VIBRATION_INTENSITY = 60

export const useAppStore = defineStore('app', () => {
  const autoUpdateServiceWorker = useLocalStorage(STORAGE_KEYS.autoUpdateServiceWorker, true)
  const zekrVibrationEnabled = useLocalStorage(STORAGE_KEYS.zekrVibrationEnabled, true)
  const zekrVibrationIntensity = useLocalStorage(STORAGE_KEYS.zekrVibrationIntensity, DEFAULT_ZEKR_VIBRATION_INTENSITY)

  if (!Number.isFinite(zekrVibrationIntensity.value)) {
    zekrVibrationIntensity.value = DEFAULT_ZEKR_VIBRATION_INTENSITY
  }

  return {
    autoUpdateServiceWorker,
    zekrVibrationEnabled,
    zekrVibrationIntensity,
  }
})
