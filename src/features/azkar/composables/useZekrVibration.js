import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'
import { useVibration } from '@/shared/composables/useVibration'

// Haptic feedback for dhikr counting, gated by the user's app settings.
export function useZekrVibration() {
  const { zekrVibrationEnabled, zekrVibrationIntensity } = storeToRefs(useAppStore())
  const { vibrate } = useVibration()

  function vibrateOnFinish() {
    if (zekrVibrationEnabled.value) vibrate(zekrVibrationIntensity.value)
  }

  return { vibrateOnFinish }
}
