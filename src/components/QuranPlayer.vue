<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useQuranStore } from '@/stores/quran'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'

const quranStore = useQuranStore()

const audioElement = ref(null)
const isPlaying = ref(false)
const loading = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const currentAudio = computed(() => quranStore.currentAudio)

const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const togglePlayPause = async () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    // If no audio is loaded, start from first verse
    if (!currentAudio.value && quranStore.currentPlaylist.length > 0) {
      quranStore.jumpToVerse(0)
      quranStore.shouldAutoPlay = true
    } else {
      try {
        await audioElement.value.play()
        isPlaying.value = true
      } catch (error) {
        console.error('Playback failed:', error)
        isPlaying.value = false
      }
    }
  }
}

const updateProgress = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const onAudioEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  quranStore.playNext()
}

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(
  currentAudio,
  async (newAudio) => {
    if (newAudio && audioElement.value) {
      audioElement.value.src = newAudio.audioUrl
      audioElement.value.load()

      // Check if we should auto-play this verse
      if (quranStore.shouldAutoPlay) {
        try {
          await audioElement.value.play()
          isPlaying.value = true
        } catch (error) {
          console.error('Auto-play prevented by browser policy')
          isPlaying.value = false
        } finally {
          quranStore.shouldAutoPlay = false
        }
      } else {
        isPlaying.value = false
      }

      currentTime.value = 0
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
  }
})
</script>

<template>
  <div class="card">
    <div class="card-body d-flex align-items-center gap-3 flex-wrap">
      <button
        @click="togglePlayPause"
        class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
        :disabled="loading"
      >
        <IconPlayerPlay v-if="!isPlaying" />
        <IconPlayerPause v-else />
      </button>

      <div class="flex-grow-1">
        <div class="d-flex gap-1 align-items-center fw-semibold" v-if="currentAudio">
          <span class="text-primary">{{ currentAudio.surahName }}</span>
          <span class="text-secondary small">آية {{ currentAudio.verseNumber }}</span>
        </div>
        <div v-else>
          <span class="text-primary">اضغط على آية للاستماع</span>
        </div>
      </div>

      <div class="flex-grow-1" style="min-width: 200px;">
        <div class="progress mb-2" style="height: 4px;">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="d-flex justify-content-between small text-muted">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <audio
      ref="audioElement"
      @loadstart="loading = true"
      @canplay="loading = false"
      @timeupdate="updateProgress"
      @ended="onAudioEnded"
      @loadedmetadata="onLoadedMetadata"
      preload="metadata"
    ></audio>
  </div>
</template>

