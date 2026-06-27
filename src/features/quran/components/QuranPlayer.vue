<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useQuranStore, PLAYBACK_RATES } from '@/features/quran/store'
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause, IconMicrophone2, IconGauge } from '@tabler/icons-vue'
import { toArabicNumerals, formatTime } from '@/shared/utils/arabic'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import SettingsReciter from '@/features/settings/components/SettingsReciter.vue'

// Render settings cards (the reciter picker) form-only inside the sheet — the
// sheet provides its own title, so the card chrome would be redundant.
provide('settings-bare', true)

const quranStore = useQuranStore()
const radioStore = useRadioStore()

const audio = ref(null)
const isPlaying = ref(false)
const loading = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const showReciterSheet = ref(false)
let reciterOnOpen = null

function openReciterSheet() {
  reciterOnOpen = Number(quranStore.currentReciter)
  showReciterSheet.value = true
}

// Only download the new reciter's audio once the sheet closes, and only if the
// selection actually changed — avoids a request per pick while browsing.
function closeReciterSheet() {
  showReciterSheet.value = false
  if (Number(quranStore.currentReciter) !== reciterOnOpen) {
    quranStore.reloadSurahAudio()
  }
}

const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))

const rateLabel = computed(() => `${toArabicNumerals(quranStore.playbackRate).replace('.', '٫')}×`)

// Advance to the next speed preset, wrapping back to the slowest at the end.
function cycleRate() {
  const i = PLAYBACK_RATES.indexOf(Number(quranStore.playbackRate))
  quranStore.playbackRate = PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]
}

const currentAyahDisplay = computed(() => {
  const ayah = quranStore.currentAyah
  if (!ayah || !quranStore.surahName) return null
  return { surahName: quranStore.surahName, ayahNumber: ayah.ayah }
})

async function tryPlay() {
  if (!audio.value) return
  if (radioStore.isPlaying) radioStore.stop()
  // The browser resets playbackRate on every source load, so set it before play.
  audio.value.playbackRate = Number(quranStore.playbackRate)
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

function loadSource(url) {
  if (!audio.value || !url) return
  audio.value.src = url
  audio.value.load()
  isPlaying.value = false
  currentTime.value = 0
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

      <div class="flex-grow-1 min-w-0">
        <template v-if="currentAyahDisplay">
          <span class="d-inline-block fw-semibold text-primary me-2">{{ currentAyahDisplay.surahName }}</span>
          <span v-if="currentAyahDisplay.ayahNumber > 0" class="d-inline-block text-secondary small"
            >آية {{ toArabicNumerals(currentAyahDisplay.ayahNumber) }}</span
          >
        </template>
        <span v-else-if="quranStore.surahName" class="text-muted">{{ quranStore.surahName }}</span>
        <span v-else class="text-muted">اضغط على آية للاستماع</span>
      </div>

      <button
        @click="openReciterSheet"
        class="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0 player-chip"
        :title="`القارئ: ${quranStore.reciter?.name}`"
      >
        <IconMicrophone2 size="18" />
        <span class="small text-truncate">{{ quranStore.reciter?.name }}</span>
      </button>
    </div>

    <BottomSheet :show="showReciterSheet" title="اختيار القارئ" @close="closeReciterSheet">
      <div class="p-3">
        <SettingsReciter />
      </div>
    </BottomSheet>

    <div class="px-3 pb-3">
      <div class="progress" style="height: 0.25rem">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="d-flex justify-content-between align-items-center small text-muted mt-1">
        <span>{{ formatTime(currentTime) }}</span>

        <div class="d-flex align-items-center gap-2">
          <span>{{ formatTime(duration) }}</span>

          <button
            type="button"
            class="btn btn-sm btn-link link-secondary text-decoration-none d-flex align-items-center gap-1 py-0 px-1"
            @click="cycleRate"
            :title="`سرعة التلاوة: ${rateLabel}`"
          >
            <IconGauge size="15" />
            <span>{{ rateLabel }}</span>
          </button>
        </div>
      </div>
    </div>

    <audio
      ref="audio"
      .playbackRate="Number(quranStore.playbackRate)"
      @loadstart="loading = true"
      @canplay="loading = false"
      @timeupdate="onTimeUpdate"
      @ended="stop"
      @loadedmetadata="duration = $event.target.duration"
      preload="metadata"
    ></audio>
  </div>
</template>

<style lang="scss" scoped>
.player-chip {
  color: var(--bs-secondary-color);
  background-color: var(--bs-secondary-bg);

  &:hover {
    color: var(--bs-body-color);
    background-color: var(--bs-tertiary-bg);
  }

  .text-truncate {
    max-width: 7.5rem;
  }
}
</style>
