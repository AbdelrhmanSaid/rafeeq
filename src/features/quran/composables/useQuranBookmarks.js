import { computed, effectScope } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { parseVerseKey, verseKey } from '@/features/quran/lib/mushaf'
import '@/features/quran/styles/bookmark-colors.css'

// Each bookmark tints its ayah on the page in its own color, so several readings can be kept apart: one per color.
export const BOOKMARK_COLORS = [
  { id: 'gold', label: 'ذهبي' },
  { id: 'green', label: 'أخضر' },
  { id: 'blue', label: 'أزرق' },
  { id: 'rose', label: 'وردي' },
  { id: 'violet', label: 'بنفسجي' },
]

const COLOR_IDS = new Set(BOOKMARK_COLORS.map((c) => c.id))

const isValid = (bookmark) =>
  Boolean(parseVerseKey(bookmark?.key)) && COLOR_IDS.has(bookmark?.color) && Number.isFinite(bookmark?.at)

// A damaged or hand-edited value reads as no bookmarks rather than breaking the reader.
const serializer = {
  read(value) {
    try {
      const list = JSON.parse(value)
      return Array.isArray(list) ? list.filter(isValid) : []
    } catch {
      return []
    }
  },
  write: (value) => JSON.stringify(value),
}

// The old reader kept a single bookmark; it carries over as a gold one.
function takeLegacyBookmark() {
  const raw = localStorage.getItem(STORAGE_KEYS.quranBookmark)
  if (raw === null) return null
  localStorage.removeItem(STORAGE_KEYS.quranBookmark)
  try {
    const { surahId, ayahNumber } = JSON.parse(raw) ?? {}
    const key = verseKey(Number(surahId), Number(ayahNumber))
    return parseVerseKey(key) ? { key, color: 'gold', at: Date.now() } : null
  } catch {
    return null
  }
}

// One list shared by every screen.
let store = null

function useStore() {
  if (store) return store
  // Detached from the component that happens to ask first, so saving keeps working after it unmounts.
  store = effectScope(true).run(() => useLocalStorage(STORAGE_KEYS.quranBookmarks, [], { serializer }))
  const legacy = takeLegacyBookmark()
  if (legacy && !store.value.some((b) => b.key === legacy.key)) store.value = [...store.value, legacy]
  return store
}

export function useQuranBookmarks() {
  const bookmarks = useStore()

  // Newest first; each change moves its bookmark to the end of the stored list.
  const list = computed(() => [...bookmarks.value].reverse())
  const colors = computed(() => new Map(bookmarks.value.map((b) => [b.key, b.color])))

  // A color marks one ayah: using it again moves it. Bookmarking an ayah again changes its color.
  const setBookmark = (key, color) => {
    if (!parseVerseKey(key) || !COLOR_IDS.has(color)) return
    const others = bookmarks.value.filter((b) => b.key !== key && b.color !== color)
    bookmarks.value = [...others, { key, color, at: Date.now() }]
  }

  const removeBookmark = (key) => {
    bookmarks.value = bookmarks.value.filter((b) => b.key !== key)
  }

  return { bookmarks: list, colors, setBookmark, removeBookmark }
}

export const resetBookmarksForTests = () => (store = null)
