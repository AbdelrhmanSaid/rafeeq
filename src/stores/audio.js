import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  const currentAudio = ref(null)
  const currentPlaylist = ref([])
  const currentIndex = ref(0)
  const selectedReciter = ref('ar.alafasy')
  const isShuffleEnabled = ref(false)
  const repeatMode = ref('none') // 'none', 'one', 'all'
  const shouldAutoPlay = ref(false)

  const reciters = ref([
    {
      identifier: 'ar.alafasy',
      name: 'مشاري العفاسي',
      englishName: 'Alafasy',
    },
    {
      identifier: 'ar.abdulbasitmurattal',
      name: 'عبد الباسط عبد الصمد المرتل',
      englishName: 'Abdul Basit',
    },
    {
      identifier: 'ar.husary',
      name: 'محمود خليل الحصري',
      englishName: 'Husary',
    },
    {
      identifier: 'ar.abdurrahmaansudais',
      name: 'عبدالرحمن السديس',
      englishName: 'Abdurrahmaan As-Sudais',
    },
    {
      identifier: 'ar.mahermuaiqly',
      name: 'ماهر المعيقلي',
      englishName: 'Maher Al Muaiqly',
    },
    {
      identifier: 'ar.muhammadayyoub',
      name: 'محمد أيوب',
      englishName: 'Muhammad Ayyoub',
    },
    {
      identifier: 'ar.saoodshuraym',
      name: 'سعود الشريم',
      englishName: 'Saood bin Ibraaheem Ash-Shuraym',
    },
    {
      identifier: 'ar.shaatree',
      name: 'أبو بكر الشاطري',
      englishName: 'Abu Bakr Ash-Shaatree',
    },
    {
      identifier: 'ar.ahmedajamy',
      name: 'أحمد بن علي العجمي',
      englishName: 'Ahmed ibn Ali al-Ajamy',
    },
    {
      identifier: 'ar.hanirifai',
      name: 'هاني الرفاعي',
      englishName: 'Hani Rifai',
    },
  ])

  const currentReciter = computed(() => {
    return reciters.value.find((r) => r.identifier === selectedReciter.value) || reciters.value[0]
  })

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
      reciterName: currentReciter.value.name,
      reciterEnglishName: currentReciter.value.englishName,
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
      reciterName: currentReciter.value.name,
      reciterEnglishName: currentReciter.value.englishName,
      verse: verse,
    }))

    currentPlaylist.value = playlist
    currentIndex.value = 0
    currentAudio.value = playlist[0]
  }

  const playNext = () => {
    if (repeatMode.value === 'one') {
      // Replay current verse
      shouldAutoPlay.value = true
      return
    }

    if (hasNext.value) {
      currentIndex.value++
      currentAudio.value = currentPlaylist.value[currentIndex.value]
      shouldAutoPlay.value = true
    } else if (repeatMode.value === 'all') {
      currentIndex.value = 0
      currentAudio.value = currentPlaylist.value[0]
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

  const toggleShuffle = () => {
    isShuffleEnabled.value = !isShuffleEnabled.value
  }

  const setRepeatMode = (mode) => {
    const modes = ['none', 'one', 'all']
    if (modes.includes(mode)) {
      repeatMode.value = mode
    }
  }

  const cycleRepeatMode = () => {
    const modes = ['none', 'one', 'all']
    const currentIndex = modes.indexOf(repeatMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    repeatMode.value = modes[nextIndex]
  }

  // Initialize from localStorage
  const initializeStore = () => {
    const savedReciter = localStorage.getItem('rafeeq_selected_reciter')
    if (savedReciter && reciters.value.find((r) => r.identifier === savedReciter)) {
      selectedReciter.value = savedReciter
    }
  }

  return {
    // State
    currentAudio,
    currentPlaylist,
    currentIndex,
    selectedReciter,
    isShuffleEnabled,
    repeatMode,
    shouldAutoPlay,
    reciters,

    // Getters
    currentReciter,
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
    toggleShuffle,
    setRepeatMode,
    cycleRepeatMode,
    initializeStore,
  }
})
