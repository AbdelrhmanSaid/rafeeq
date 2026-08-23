import { useSyncExternalStore } from 'react'

function subscribe(listener) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)

  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

// Network reachability as reported by the browser.
export function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}
