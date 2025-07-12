<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'

const audioStore = useAudioStore()

const audioElement = ref(null)
const isPlaying = ref(false)
const loading = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const currentAudio = computed(() => audioStore.currentAudio)

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
    if (!currentAudio.value && audioStore.currentPlaylist.length > 0) {
      audioStore.jumpToVerse(0)
      audioStore.shouldAutoPlay = true
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
  audioStore.playNext()
}

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(
  currentAudio,
  (newAudio) => {
    if (newAudio && audioElement.value) {
      audioElement.value.src = newAudio.audioUrl
      audioElement.value.load()

      // Check if we should auto-play this verse
      if (audioStore.shouldAutoPlay) {
        audioElement.value.addEventListener(
          'canplay',
          async () => {
            try {
              await audioElement.value.play()
              isPlaying.value = true
              audioStore.shouldAutoPlay = false // Reset the flag
            } catch (error) {
              console.log('Auto-play prevented by browser policy')
              isPlaying.value = false
              audioStore.shouldAutoPlay = false
            }
          },
          { once: true },
        )
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
  <div class="audio-player card">
    <div class="audio-controls card-body">
      <button @click="togglePlayPause" class="btn btn-primary" :disabled="loading">
        <IconPlayerPlay v-if="!isPlaying" />
        <IconPlayerPause v-else />
      </button>

      <div class="audio-info">
        <div class="verse-info" v-if="currentAudio">
          <span class="surah-name">{{ currentAudio.surahName }}</span>
          <span class="verse-number">آية {{ currentAudio.verseNumber }}</span>
        </div>
        <div class="verse-info" v-else>
          <span class="surah-name">اضغط على آية للاستماع</span>
        </div>
        <div class="reciter-name" v-if="currentAudio">{{ currentAudio.reciterName }}</div>
      </div>

      <div class="audio-progress">
        <div class="progress">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="time-display">
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

<style scoped>
.audio-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.audio-controls button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-info {
  flex: 1;
  min-width: 0;
}

.verse-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.surah-name {
  color: var(--bs-primary);
}

.verse-number {
  color: var(--bs-secondary);
  font-size: 0.8rem;
}

.reciter-name {
  font-size: 0.8rem;
  color: var(--bs-muted);
  margin-top: 0.25rem;
}

.audio-progress {
  flex: 2;
  min-width: 200px;
}

.progress {
  height: 4px;
  background: var(--bs-secondary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: var(--bs-primary);
  transition: width 0.1s ease;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--bs-muted);
}

@media (max-width: 768px) {
  .audio-controls {
    flex-wrap: wrap;
  }

  .audio-progress {
    order: 3;
    flex: 100%;
    margin-top: 1rem;
  }
}
</style>
