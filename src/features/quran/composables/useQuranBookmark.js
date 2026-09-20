import { useLocalStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { normalizeQuranicText } from '@/shared/utils/arabic'

// VueUse's default serializer cannot round-trip null.
const jsonSerializer = {
  read: (value) => {
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },
  write: (value) => JSON.stringify(value),
}

// Module scope keeps the single bookmark shared across all consumers.
const bookmark = useLocalStorage(STORAGE_KEYS.quranBookmark, null, { serializer: jsonSerializer })

export const useQuranBookmark = () => {
  const isBookmarked = (surahId, ayahNumber) =>
    !!bookmark.value && bookmark.value.surahId === Number(surahId) && bookmark.value.ayahNumber === ayahNumber

  const setBookmark = ({ surahId, surahName, ayahNumber, text }) => {
    bookmark.value = { surahId: Number(surahId), surahName: normalizeQuranicText(surahName), ayahNumber, text }
  }

  const clearBookmark = () => {
    bookmark.value = null
  }

  const toggleBookmark = (ayah) => {
    if (isBookmarked(ayah.surahId, ayah.ayahNumber)) {
      clearBookmark()
    } else {
      setBookmark(ayah)
    }
  }

  return {
    bookmark,
    isBookmarked,
    setBookmark,
    clearBookmark,
    toggleBookmark,
  }
}
