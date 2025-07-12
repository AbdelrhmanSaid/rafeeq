import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQuranStore = defineStore('audio', () => {
  const currentAudio = ref(null)
  const currentPlaylist = ref([])
  const currentIndex = ref(0)
  const shouldAutoPlay = ref(false)

  const hasNext = computed(() => {
    return currentIndex.value < currentPlaylist.value.length - 1
  })

  const hasPrevious = computed(() => {
    return currentIndex.value > 0
  })

  const mapper = (verse, surahInfo) => {
    return {
      audioUrl: verse.audio,
      audioSecondary: verse.audioSecondary,
      verseNumber: verse.numberInSurah,
      surahName: surahInfo.name,
      surahEnglishName: surahInfo.englishName,
      verse: verse,
    }
  }

  const playVerse = (verse, surahInfo) => {
    currentAudio.value = mapper(verse, surahInfo)
  }

  const playSurah = (surahData) => {
    const playlist = surahData.ayahs.map((verse) => mapper(verse, surahData))

    currentPlaylist.value = playlist
    currentIndex.value = 0
    currentAudio.value = playlist[0]
  }

  const playNext = () => {
    if (hasNext.value) {
      currentIndex.value++
      currentAudio.value = currentPlaylist.value[currentIndex.value]
      shouldAutoPlay.value = true
    }
  }

  const jumpToVerse = (verseIndex) => {
    if (currentPlaylist.value.length > 0 && verseIndex >= 0 && verseIndex < currentPlaylist.value.length) {
      currentIndex.value = verseIndex
      currentAudio.value = currentPlaylist.value[verseIndex]
    }
  }

  return {
    currentAudio,
    currentPlaylist,
    currentIndex,
    shouldAutoPlay,

    hasNext,
    hasPrevious,

    playVerse,
    playSurah,
    playNext,
    jumpToVerse,
  }
})
