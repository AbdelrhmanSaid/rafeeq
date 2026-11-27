import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'

export function useZekrVibration() {
  const { zekrVibrationEnabled, zekrVibrationIntensity } = storeToRefs(useAppStore())

  function vibrateOnFinish() {
    if (zekrVibrationEnabled.value && 'vibrate' in navigator) navigator.vibrate(zekrVibrationIntensity.value)
  }

  return { vibrateOnFinish }
}
