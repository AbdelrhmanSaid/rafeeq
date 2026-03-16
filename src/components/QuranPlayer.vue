<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuranStore } from '@/stores/quran'
import { useRadioStore } from '@/stores/radio'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { toArabicNumerals, formatTime } from '@/utilities/arabic'

const quranStore = useQuranStore()
const radioStore = useRadioStore()

const audio = ref(null)
const isPlaying = ref(false)
const loading = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))

const currentAyahDisplay = computed(() => {
  const ayah = quranStore.currentAyah
  if (!ayah || !quranStore.surahName) return null
  return { surahName: quranStore.surahName, ayahNumber: ayah.ayah }
})

async function tryPlay() {
  if (!audio.value) return
  if (radioStore.isPlaying) radioStore.stop()
  try {
    await audio.value.play()
    isPlaying.value = true
  } catch {
    isPlaying.value = false
  }
}

function stop() {
  if (audio.value) {
    audio.value.pause()
    audio.value.currentTime = 0
  }
  isPlaying.value = false
  currentTime.value = 0
  quranStore.resetAyahTracking()
}

async function togglePlayPause() {
  if (!audio.value) return
  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  } else {
    await tryPlay()
  }
}

async function seekToAyah(ayahNumber) {
  if (isPlaying.value && quranStore.currentAyah?.ayah === ayahNumber) {
    stop()
    return
  }

  const startTime = quranStore.getAyahStartTime(ayahNumber)
  if (startTime === null || !audio.value) return

  audio.value.currentTime = startTime
  quranStore.updateCurrentAyahFromTime(startTime * 1000)
  await tryPlay()
}

function onTimeUpdate() {
  if (!audio.value) return
  currentTime.value = audio.value.currentTime
  if (isPlaying.value) {
    quranStore.updateCurrentAyahFromTime(currentTime.value * 1000)
  }
}

async function loadSource(url) {
  if (!audio.value || !url) return
  audio.value.src = url
  audio.value.load()
  isPlaying.value = false
  currentTime.value = 0

  if (quranStore.shouldAutoPlay) {
    await tryPlay()
    quranStore.shouldAutoPlay = false
  }
}

watch(() => quranStore.surahAudioUrl, loadSource)
onMounted(() => loadSource(quranStore.surahAudioUrl))
onUnmounted(() => audio.value?.pause())

defineExpose({ seekToAyah })
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
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="d-flex justify-content-between small text-muted mt-1">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <audio
      ref="audio"
      @loadstart="loading = true"
      @canplay="loading = false"
      @timeupdate="onTimeUpdate"
      @ended="stop"
      @loadedmetadata="duration = $event.target.duration"
      preload="metadata"
    ></audio>
  </div>
</template>
