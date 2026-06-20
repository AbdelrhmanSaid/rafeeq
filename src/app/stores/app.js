import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

export const useAppStore = defineStore('app', () => {
  const autoUpdateServiceWorker = useLocalStorage(STORAGE_KEYS.autoUpdateServiceWorker, true)
  const zekrVibrationEnabled = useLocalStorage(STORAGE_KEYS.zekrVibrationEnabled, true)
  const zekrVibrationIntensity = useLocalStorage(STORAGE_KEYS.zekrVibrationIntensity, 60)

  if (!Number.isFinite(zekrVibrationIntensity.value)) {
    zekrVibrationIntensity.value = 20
  }

  return {
    autoUpdateServiceWorker,
    zekrVibrationEnabled,
    zekrVibrationIntensity,
  }
})
