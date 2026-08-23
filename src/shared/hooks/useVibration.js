import { useCallback } from 'react'

// Generic device haptics — no-op where the API is unavailable. The caller
// decides whether and how strongly to vibrate.
export function useVibration() {
  const vibrate = useCallback((pattern) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return { vibrate }
}
