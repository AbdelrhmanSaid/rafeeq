import { useCallback, useMemo } from 'react'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

const EMPTY = []

// A named list of favorite keys, persisted and shared across every component
// that opens the same storage key.
export const useFavorites = (storageKey) => {
  const [keys, setKeys] = useLocalStorage(storageKey, EMPTY)

  const isFavorite = useCallback((key) => keys.includes(key), [keys])

  const toggleFavorite = useCallback(
    (key) => setKeys((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key])),
    [setKeys],
  )

  const filterFavorites = useCallback((items, keyFn) => items.filter((item) => isFavorite(keyFn(item))), [isFavorite])

  return useMemo(
    () => ({ keys, isFavorite, toggleFavorite, filterFavorites }),
    [keys, isFavorite, toggleFavorite, filterFavorites],
  )
}
