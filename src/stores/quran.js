import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import reciters from '@/exports/QuranReciters.js'

const DEFAULT_RECITER_ID = 259

export const useQuranStore = defineStore('quran', () => {
  const currentReciter = useLocalStorage('currentReciter', DEFAULT_RECITER_ID)
  const shouldAutoPlay = ref(false)

  const surahAudioUrl = ref(null)
  const surahName = ref(null)
  const currentSurahNumber = ref(null)
  const ayahTimings = ref([])
  const currentAyahIndex = ref(-1)

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

  const currentAyah = computed(() => {
    if (currentAyahIndex.value < 0 || currentAyahIndex.value >= ayahTimings.value.length) return null
    return ayahTimings.value[currentAyahIndex.value]
  })

  function getSurahAudioUrl(surahNumber) {
    const r = reciter.value
    if (!r) return null
    const paddedNumber = String(surahNumber).padStart(3, '0')
    return `${r.folder_url}${paddedNumber}.mp3`
  }

  async function fetchTimings(surahNumber) {
    const r = reciter.value
    if (!r) return []

    const response = await fetch(`https://www.mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${r.id}`)
    if (!response.ok) throw new Error('Failed to fetch ayah timings')
    return await response.json()
  }

  async function loadSurahAudio(surahNumber, name) {
    currentSurahNumber.value = surahNumber
    surahName.value = name
    surahAudioUrl.value = getSurahAudioUrl(surahNumber)
    currentAyahIndex.value = -1

    try {
      const timings = await fetchTimings(surahNumber)
      ayahTimings.value = timings
    } catch {
      ayahTimings.value = []
    }
  }

  function updateCurrentAyahFromTime(timeMs) {
    const timings = ayahTimings.value
    if (!timings.length) return

    for (let i = timings.length - 1; i >= 0; i--) {
      if (timeMs >= timings[i].start_time) {
        if (currentAyahIndex.value !== i) {
          currentAyahIndex.value = i
        }
        return
      }
    }
    currentAyahIndex.value = 0
  }

  function getAyahStartTime(ayahNumber) {
    const timing = ayahTimings.value.find((t) => t.ayah === ayahNumber)
    return timing ? timing.start_time / 1000 : null
  }

  function resetAyahTracking() {
    currentAyahIndex.value = -1
  }

  async function changeReciter(reciterId) {
    currentReciter.value = reciterId
    if (currentSurahNumber.value && surahName.value) {
      await loadSurahAudio(currentSurahNumber.value, surahName.value)
    }
  }

  return {
    currentReciter,
    shouldAutoPlay,
    surahAudioUrl,
    surahName,
    currentSurahNumber,
    ayahTimings,

    reciter,
    currentAyah,

    loadSurahAudio,
    updateCurrentAyahFromTime,
    getAyahStartTime,
    resetAyahTracking,
    changeReciter,
  }
})
