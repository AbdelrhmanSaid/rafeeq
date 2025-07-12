import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQuranStore = defineStore('audio', () => {
  const currentAudio = ref(null)
  const currentPlaylist = ref([])
  const currentIndex = ref(0)
  const selectedReciter = ref('ar.alafasy')
  const shouldAutoPlay = ref(false)

  const hasNext = computed(() => {
    return currentIndex.value < currentPlaylist.value.length - 1
  })

  const hasPrevious = computed(() => {
    return currentIndex.value > 0
  })

  const playVerse = (verse, surahInfo) => {
    const audioData = {
      audioUrl: verse.audio,
      audioSecondary: verse.audioSecondary,
      verseNumber: verse.numberInSurah,
      surahName: surahInfo.name,
      surahEnglishName: surahInfo.englishName,
      verse: verse,
    }

    currentAudio.value = audioData
  }

  const playSurah = (surahData) => {
    const playlist = surahData.ayahs.map((verse) => ({
      audioUrl: verse.audio,
      audioSecondary: verse.audioSecondary,
      verseNumber: verse.numberInSurah,
      surahName: surahData.name,
      surahEnglishName: surahData.englishName,
      verse: verse,
    }))

    currentPlaylist.value = playlist
    currentIndex.value = 0
    currentAudio.value = playlist[0]
  }

  const playNext = () => {
    if (hasNext.value) {
      currentIndex.value++
      currentAudio.value = currentPlaylist.value[currentIndex.value]
      shouldAutoPlay.value = true
    } else {
      stop()
    }
  }

  const jumpToVerse = (verseIndex) => {
    if (currentPlaylist.value.length > 0 && verseIndex >= 0 && verseIndex < currentPlaylist.value.length) {
      currentIndex.value = verseIndex
      currentAudio.value = currentPlaylist.value[verseIndex]
    }
  }

  const playPrevious = () => {
    if (hasPrevious.value) {
      currentIndex.value--
      currentAudio.value = currentPlaylist.value[currentIndex.value]
    }
  }

  const stop = () => {
    currentAudio.value = null
    currentPlaylist.value = []
    currentIndex.value = 0
  }

  const setReciter = (reciterIdentifier) => {
    selectedReciter.value = reciterIdentifier
    // Save to localStorage
    localStorage.setItem('rafeeq_selected_reciter', reciterIdentifier)
  }

  // Initialize from localStorage
  const initializeStore = () => {
    selectedReciter.value = 'ar.alafasy'
  }

  return {
    // State
    currentAudio,
    currentPlaylist,
    currentIndex,
    selectedReciter,
    shouldAutoPlay,

    // Getters
    hasNext,
    hasPrevious,

    // Actions
    playVerse,
    playSurah,
    playNext,
    playPrevious,
    jumpToVerse,
    stop,
    setReciter,
    initializeStore,
  }
})
