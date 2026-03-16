<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuranStore } from '@/stores/quran'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { useRadioStore } from '@/stores/radio'
import { toArabicNumerals } from '@/utilities/arabic'

const quranStore = useQuranStore()
const radioStore = useRadioStore()

const audioElement = ref(null)
const isPlaying = ref(false)
const loading = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const progressPercentage = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))

const currentAyahDisplay = computed(() => {
  const ayah = quranStore.currentAyah
  if (!ayah || !quranStore.surahName) return null
  return {
    surahName: quranStore.surahName,
    ayahNumber: ayah.ayah,
  }
})

const togglePlayPause = async () => {
  if (!audioElement.value) return

  if (radioStore.isPlaying) {
    radioStore.stop()
  }

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
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
    if (isPlaying.value) {
      quranStore.updateCurrentAyahFromTime(currentTime.value * 1000)
    }
  }
}

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const resetPlayer = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
  }

  isPlaying.value = false
  currentTime.value = 0
  quranStore.currentAyahIndex = -1
}

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '٠:٠٠'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return toArabicNumerals(`${mins}:${secs.toString().padStart(2, '0')}`)
}

async function seekToAyah(ayahNumber) {
  if (isPlaying.value && quranStore.currentAyah?.ayah === ayahNumber) {
    resetPlayer()
    return
  }

  const startTime = quranStore.getAyahStartTime(ayahNumber)
  if (startTime !== null && audioElement.value) {
    if (radioStore.isPlaying) {
      radioStore.stop()
    }
    audioElement.value.currentTime = startTime
    quranStore.updateCurrentAyahFromTime(startTime * 1000)
    try {
      await audioElement.value.play()
      isPlaying.value = true
    } catch {
      isPlaying.value = false
    }
  }
}

defineExpose({ seekToAyah })

async function loadAudioSource(url) {
  if (!audioElement.value || !url) return
  audioElement.value.src = url
  audioElement.value.load()
  isPlaying.value = false
  currentTime.value = 0

  if (quranStore.shouldAutoPlay) {
    try {
      await audioElement.value.play()
      isPlaying.value = true
    } catch {
      isPlaying.value = false
    }
    quranStore.shouldAutoPlay = false
  }
}

watch(
  () => quranStore.surahAudioUrl,
  (newUrl) => loadAudioSource(newUrl),
)

onMounted(() => {
  if (quranStore.surahAudioUrl) {
    loadAudioSource(quranStore.surahAudioUrl)
  }
})

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
        :disabled="loading || !quranStore.surahAudioUrl"
        style="width: 40px; height: 40px"
      >
        <IconPlayerPlay v-if="!isPlaying" />
        <IconPlayerPause v-else />
      </button>

      <div class="flex-grow-1">
        <template v-if="currentAyahDisplay">
          <span class="d-inline-block fw-semibold text-primary me-2">{{ currentAyahDisplay.surahName }}</span>
          <span v-if="currentAyahDisplay.ayahNumber > 0" class="d-inline-block text-secondary small"
            >آية {{ toArabicNumerals(currentAyahDisplay.ayahNumber) }}</span
          >
        </template>
        <span v-else-if="quranStore.surahName" class="text-muted">{{ quranStore.surahName }}</span>
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
      @ended="resetPlayer"
      @loadedmetadata="onLoadedMetadata"
      preload="metadata"
    ></audio>
  </div>
</template>
