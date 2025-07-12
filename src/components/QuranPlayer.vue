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

const progressPercentage = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))

const togglePlayPause = async () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else if (!currentAudio.value && quranStore.currentPlaylist.length > 0) {
    quranStore.jumpToVerse(0)
    quranStore.shouldAutoPlay = true
  } else {
    try {
      await audioElement.value.play()
      isPlaying.value = true
    } catch {
      isPlaying.value = false
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
    if (!audioElement.value || !newAudio) return
    audioElement.value.src = newAudio.audioUrl
    audioElement.value.load()

    if (quranStore.shouldAutoPlay) {
      try {
        await audioElement.value.play()
        isPlaying.value = true
      } catch {
        isPlaying.value = false
      }
      quranStore.shouldAutoPlay = false
    } else {
      isPlaying.value = false
    }

    currentTime.value = 0
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
    <div class="card-body d-flex align-items-center gap-3">
      <button
        @click="togglePlayPause"
        class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
        :disabled="loading"
        style="width: 40px; height: 40px"
      >
        <IconPlayerPlay v-if="!isPlaying" />
        <IconPlayerPause v-else />
      </button>

      <div class="flex-grow-1">
        <template v-if="currentAudio">
          <span class="fw-semibold text-primary">{{ currentAudio.surahName }}</span>
          <span class="text-secondary small">آية {{ currentAudio.verseNumber }}</span>
        </template>
        <span v-else class="text-muted">اضغط على آية للاستماع</span>
      </div>
    </div>

    <div class="px-3 pb-3">
      <div class="progress" style="height: 0.25rem">
        <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="d-flex justify-content-between small text-muted mt-1">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
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

<style scoped></style>
