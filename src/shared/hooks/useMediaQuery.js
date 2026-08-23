import { useCallback, useSyncExternalStore } from 'react'

// Tracks a CSS media query, re-rendering whenever it starts or stops matching.
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (listener) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
