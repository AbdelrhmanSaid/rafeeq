import { useLocalStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

// useLocalStorage's default serializer can't round-trip `null`, so store the
// bookmark object (or null) as JSON ourselves.
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

// A single, app-wide Quran bookmark. Setting a new one replaces any previous
// bookmark, so only one ayah is ever bookmarked at a time. Shared at module
// scope so every view/component reads and writes the same reactive value.
const bookmark = useLocalStorage(STORAGE_KEYS.quranBookmark, null, { serializer: jsonSerializer })

export const useQuranBookmark = () => {
  const isBookmarked = (surahId, ayahNumber) =>
    !!bookmark.value && bookmark.value.surahId === Number(surahId) && bookmark.value.ayahNumber === ayahNumber

  const setBookmark = ({ surahId, surahName, ayahNumber, text }) => {
    bookmark.value = { surahId: Number(surahId), surahName, ayahNumber, text }
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
