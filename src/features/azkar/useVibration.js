import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'

// Haptic feedback for dhikr counting, gated by the user's app settings.
export function useVibration() {
  const { zekrVibrationEnabled, zekrVibrationIntensity } = storeToRefs(useAppStore())

  function vibrate() {
    if (zekrVibrationEnabled.value && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(zekrVibrationIntensity.value)
    }
  }

  return { vibrate }
}
