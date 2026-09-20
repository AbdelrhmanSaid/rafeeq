export function useVibration() {
  function vibrate(pattern) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return { vibrate }
}
