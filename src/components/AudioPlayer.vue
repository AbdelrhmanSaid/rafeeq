<template>
  <div class="audio-player" v-if="currentAudio">
    <div class="audio-controls">
      <button 
        @click="togglePlayPause" 
        class="btn btn-primary"
        :disabled="loading"
      >
        <IconPlayerPlay v-if="!isPlaying" />
        <IconPlayerPause v-else />
      </button>
      
      <div class="audio-info">
        <div class="verse-info">
          <span class="surah-name">{{ currentAudio.surahName }}</span>
          <span class="verse-number">آية {{ currentAudio.verseNumber }}</span>
        </div>
        <div class="reciter-name">{{ currentAudio.reciterName }}</div>
      </div>
      
      <div class="audio-progress">
        <div class="progress">
          <div 
            class="progress-bar" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
      
      <div class="volume-control">
        <IconVolume />
        <input 
          type="range" 
          v-model="volume" 
          min="0" 
          max="1" 
          step="0.1"
          @input="updateVolume"
        >
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

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { IconPlayerPlay, IconPlayerPause, IconVolume } from '@tabler/icons-vue'

const audioStore = useAudioStore()

const audioElement = ref(null)
const isPlaying = ref(false)
const loading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)

const currentAudio = computed(() => audioStore.currentAudio)

const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const togglePlayPause = () => {
  if (!audioElement.value) return
  
  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    audioElement.value.play()
    isPlaying.value = true
  }
}

const updateProgress = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const updateVolume = () => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
}

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
    audioElement.value.volume = volume.value
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

watch(currentAudio, (newAudio) => {
  if (newAudio && audioElement.value) {
    audioElement.value.src = newAudio.audioUrl
    audioElement.value.load()
    isPlaying.value = false
    currentTime.value = 0
  }
}, { immediate: true })

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
  }
})
</script>

<style scoped>
.audio-player {
  background: var(--bs-light);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

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

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-control input[type="range"] {
  width: 80px;
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
  
  .volume-control {
    margin-left: auto;
  }
}
</style>