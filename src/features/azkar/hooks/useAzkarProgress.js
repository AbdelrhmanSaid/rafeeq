import { useCallback, useMemo, useState } from 'react'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

// Local date as YYYY-MM-DD, used to expire progress at the day boundary.
const today = () => new Date().toLocaleDateString('en-CA')

const EMPTY_PROGRESS = { date: '', counts: {} }

/**
 * Per-category zekr counts that survive reloads but reset each day. `counts` is
 * an object keyed by the zekr's index within the category. When `persist` is
 * false the counts live only in memory, so progress resets on reload.
 */
export const useAzkarProgress = (slug, persist = true) => {
  const [persisted, setPersisted] = useLocalStorage(`${STORAGE_KEYS.azkarProgress}:${slug}`, EMPTY_PROGRESS)
  const [inMemory, setInMemory] = useState(EMPTY_PROGRESS)

  const progress = persist ? persisted : inMemory
  const setProgress = persist ? setPersisted : setInMemory

  // Counts from an earlier day are ignored rather than rewritten, so reading
  // progress stays free of side effects.
  const counts = progress.date === today() ? progress.counts : EMPTY_PROGRESS.counts

  const setCount = useCallback(
    (index, count) =>
      setProgress((current) => ({
        date: today(),
        counts: { ...(current.date === today() ? current.counts : {}), [index]: count },
      })),
    [setProgress],
  )

  const reset = useCallback(() => setProgress({ date: today(), counts: {} }), [setProgress])

  return useMemo(() => ({ counts, setCount, reset }), [counts, setCount, reset])
}
