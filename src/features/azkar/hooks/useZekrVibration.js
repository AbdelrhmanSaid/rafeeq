import { useCallback } from 'react'
import { useAppStore } from '@/app/stores/app'
import { useVibration } from '@/shared/hooks/useVibration'

// Haptic feedback for zekr counting, gated by the user's app settings.
export function useZekrVibration() {
  const enabled = useAppStore((state) => state.zekrVibrationEnabled)
  const intensity = useAppStore((state) => state.zekrVibrationIntensity)
  const { vibrate } = useVibration()

  const vibrateOnFinish = useCallback(() => {
    if (enabled) vibrate(intensity)
  }, [enabled, intensity, vibrate])

  return { vibrateOnFinish }
}
