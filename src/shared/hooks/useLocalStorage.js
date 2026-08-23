import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { ensureStorage, readStorage, subscribeStorage, writeStorage } from '@/shared/lib/storage'

/**
 * Reactive localStorage value shared by every component that reads the key.
 * `defaultValue` is captured on first render, so pass a stable value.
 *
 * @returns {[unknown, (value: unknown | ((current: unknown) => unknown)) => void]}
 */
export function useLocalStorage(key, defaultValue) {
  const fallback = useRef(defaultValue)

  const subscribe = useCallback((listener) => subscribeStorage(key, listener), [key])
  const getSnapshot = useCallback(() => readStorage(key, fallback.current), [key])

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    ensureStorage(key, fallback.current)
  }, [key])

  const setValue = useCallback(
    (next) => {
      const current = readStorage(key, fallback.current)
      writeStorage(key, typeof next === 'function' ? next(current) : next)
    },
    [key],
  )

  return [value, setValue]
}
