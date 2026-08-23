import { useCallback, useMemo } from 'react'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { normalizeQuranicText } from '@/shared/utils/arabic'

// A single, app-wide Quran bookmark. Setting a new one replaces any previous
// bookmark, so only one ayah is ever bookmarked at a time.
export const useQuranBookmark = () => {
  const [bookmark, setStoredBookmark] = useLocalStorage(STORAGE_KEYS.quranBookmark, null)

  const isBookmarked = useCallback(
    (surahId, ayahNumber) => !!bookmark && bookmark.surahId === Number(surahId) && bookmark.ayahNumber === ayahNumber,
    [bookmark],
  )

  const setBookmark = useCallback(
    ({ surahId, surahName, ayahNumber, text }) =>
      setStoredBookmark({ surahId: Number(surahId), surahName: normalizeQuranicText(surahName), ayahNumber, text }),
    [setStoredBookmark],
  )

  const clearBookmark = useCallback(() => setStoredBookmark(null), [setStoredBookmark])

  const toggleBookmark = useCallback(
    (ayah) => {
      if (isBookmarked(ayah.surahId, ayah.ayahNumber)) clearBookmark()
      else setBookmark(ayah)
    },
    [isBookmarked, clearBookmark, setBookmark],
  )

  return useMemo(
    () => ({ bookmark, isBookmarked, setBookmark, clearBookmark, toggleBookmark }),
    [bookmark, isBookmarked, setBookmark, clearBookmark, toggleBookmark],
  )
}
