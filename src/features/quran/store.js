import { create } from 'zustand'
import { persistFields } from '@/shared/lib/persist'
import reciters from '@/features/quran/data/reciters.js'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { API } from '@/shared/constants/api'

const DEFAULT_RECITER_ID = 51
const DEFAULT_TAFSEER = 'ar.muyassar'

// Playback speed presets offered by the player, from slowest to fastest.
export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

// Monotonic token for loadSurahAudio() so stale timing responses are ignored.
let timingsRequestId = 0

const findReciter = (id) => reciters.find((reciter) => reciter.id === Number(id))

async function fetchTimings(reciter, surahNumber) {
  const response = await fetch(`${API.mp3quran}/ayat_timing?surah=${surahNumber}&read=${reciter.id}`)
  if (!response.ok) throw new Error('Failed to fetch ayah timings')
  return response.json()
}

export const useQuranStore = create(
  persistFields({
    currentReciter: STORAGE_KEYS.currentReciter,
    currentTafseer: STORAGE_KEYS.currentTafseer,
    playbackRate: STORAGE_KEYS.playbackRate,
  })((set, get) => ({
    currentReciter: DEFAULT_RECITER_ID,
    currentTafseer: DEFAULT_TAFSEER,
    playbackRate: 1,

    surahAudioUrl: null,
    surahName: null,
    currentSurahNumber: null,
    ayahTimings: [],
    currentAyahIndex: -1,

    setCurrentTafseer: (identifier) => set({ currentTafseer: identifier }),
    setPlaybackRate: (rate) => set({ playbackRate: rate }),

    // Persist the selection only. Reloading the (potentially large) audio file is
    // deferred to reloadSurahAudio() so rapid reciter switches don't each trigger
    // a download — the caller reloads once when it's done changing.
    changeReciter: (reciterId) => set({ currentReciter: reciterId }),

    async loadSurahAudio(surahNumber, name) {
      const reciter = findReciter(get().currentReciter)
      const paddedNumber = String(surahNumber).padStart(3, '0')

      // Each load gets its own token. Timings for an older load (a slower
      // request for the previous surah, or the previous reciter) are dropped
      // when they arrive, so audio and highlighting never belong to a surah
      // other than the one on screen.
      const requestId = ++timingsRequestId

      set({
        currentSurahNumber: surahNumber,
        surahName: name,
        surahAudioUrl: reciter ? `${reciter.folder_url}${paddedNumber}.mp3` : null,
        currentAyahIndex: -1,
        ayahTimings: [],
      })

      if (!reciter) return

      let timings = []
      try {
        timings = await fetchTimings(reciter, surahNumber)
      } catch {
        timings = []
      }

      const { currentSurahNumber, currentReciter } = get()
      const isCurrent =
        requestId === timingsRequestId && currentSurahNumber === surahNumber && Number(currentReciter) === reciter.id

      if (isCurrent) set({ ayahTimings: Array.isArray(timings) ? timings : [] })
    },

    reloadSurahAudio() {
      const { currentSurahNumber, surahName, loadSurahAudio } = get()
      if (currentSurahNumber && surahName) return loadSurahAudio(currentSurahNumber, surahName)
    },

    updateCurrentAyahFromTime(timeMs) {
      const { ayahTimings, currentAyahIndex } = get()
      if (!ayahTimings.length) return

      for (let index = ayahTimings.length - 1; index >= 0; index--) {
        if (timeMs >= ayahTimings[index].start_time) {
          if (currentAyahIndex !== index) set({ currentAyahIndex: index })
          return
        }
      }

      set({ currentAyahIndex: 0 })
    },

    getAyahStartTime(ayahNumber) {
      const timing = get().ayahTimings.find((item) => item.ayah === ayahNumber)
      return timing ? timing.start_time / 1000 : null
    },

    resetAyahTracking: () => set({ currentAyahIndex: -1 }),
  })),
)

// A reciter that no longer exists (removed from the data set) falls back to the
// default instead of leaving playback broken.
if (!findReciter(useQuranStore.getState().currentReciter)) {
  useQuranStore.setState({ currentReciter: DEFAULT_RECITER_ID })
}

export const selectReciter = (state) => findReciter(state.currentReciter)

export const selectCurrentAyah = (state) => state.ayahTimings[state.currentAyahIndex] ?? null
