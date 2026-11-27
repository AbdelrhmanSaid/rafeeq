import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import reciters from '@/features/quran/data/reciters.js'
import readerBackgrounds, { DEFAULT_READER_BACKGROUND } from '@/features/quran/data/readerBackgrounds.js'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { API } from '@/shared/constants/api'

const DEFAULT_RECITER_ID = 51
const DEFAULT_TAFSEER = 'ar.muyassar'

export const useQuranStore = defineStore('quran', () => {
  const currentReciter = useLocalStorage(STORAGE_KEYS.currentReciter, DEFAULT_RECITER_ID)
  const currentTafseer = useLocalStorage(STORAGE_KEYS.currentTafseer, DEFAULT_TAFSEER)
  const lastPage = useLocalStorage(STORAGE_KEYS.quranLastPage, 0)
  const readerBackground = useLocalStorage(STORAGE_KEYS.quranReaderBackground, DEFAULT_READER_BACKGROUND)

  // An unknown value, from an old or edited backup, reads as the default.
  const readerBackgroundOption = computed(
    () => readerBackgrounds.find((option) => option.value === readerBackground.value) ?? readerBackgrounds[0],
  )

  const reciter = computed(() => {
    const id = Number(currentReciter.value)
    return reciters.find((r) => r.id === id)
  })

  watch(
    reciter,
    (r) => {
      if (!r) currentReciter.value = DEFAULT_RECITER_ID
    },
    { immediate: true },
  )

  function surahAudioUrl(surah) {
    const r = reciter.value
    return r ? `${r.folder_url}${String(surah).padStart(3, '0')}.mp3` : null
  }

  // Ayah start times in ms within the surah recording; ayah 0 is the Basmala.
  async function fetchAyahTimings(surah) {
    const r = reciter.value
    if (!r) return []
    const response = await fetch(`${API.mp3quran}/ayat_timing?surah=${surah}&read=${r.id}`)
    if (!response.ok) throw new Error('Failed to fetch ayah timings')
    return response.json()
  }

  function changeReciter(reciterId) {
    currentReciter.value = reciterId
  }

  return {
    currentReciter,
    currentTafseer,
    lastPage,
    readerBackground,
    readerBackgroundOption,
    reciter,
    surahAudioUrl,
    fetchAyahTimings,
    changeReciter,
  }
})
