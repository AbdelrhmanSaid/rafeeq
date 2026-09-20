<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useMediaControls } from '@vueuse/core'
import { useQuranStore, PLAYBACK_RATES } from '@/features/quran/store'
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause, IconMicrophone2, IconGauge } from '@tabler/icons-vue'
import { toArabicNumerals, formatTime, removeSurahPrefix, normalizeQuranicText } from '@/shared/utils/arabic'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import SettingsReciter from '@/features/settings/components/SettingsReciter.vue'
import {
  setMediaMetadata,
  setMediaHandlers,
  setMediaPlaybackState,
  setMediaPositionState,
  clearMediaSession,
} from '@/shared/utils/mediaSession'

const props = defineProps({
  surahNumber: { type: Number, required: true },
  surahName: { type: String, required: true },
})

provide('settings-bare', true)

const quranStore = useQuranStore()
const radioStore = useRadioStore()

// A recite tap waits for timings that load independently of the page.
let audioReady = Promise.resolve()

const trackAudioLoad = (promise) => (audioReady = promise ?? Promise.resolve())

watch(
  () => [props.surahNumber, props.surahName],
  ([surahNumber, surahName]) => trackAudioLoad(quranStore.loadSurahAudio(surahNumber, surahName)),
  { immediate: true },
)

const audio = ref(null)
// Keep initial loading separate from mid-play buffering.
const loading = ref(false)
// Media events report buffering as paused, so explicit controls own this state.
const isPlaying = ref(false)
const { currentTime, duration } = useMediaControls(audio)

const showReciterSheet = ref(false)
let reciterOnOpen = null

function openReciterSheet() {
  reciterOnOpen = Number(quranStore.currentReciter)
  showReciterSheet.value = true
}

// Reload once after reciter selection settles.
function closeReciterSheet() {
  showReciterSheet.value = false
  if (Number(quranStore.currentReciter) !== reciterOnOpen) {
    trackAudioLoad(quranStore.reloadSurahAudio())
  }
}

const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))

const rateLabel = computed(() => `${toArabicNumerals(quranStore.playbackRate).replace('.', '٫')}×`)

function cycleRate() {
  const i = PLAYBACK_RATES.indexOf(Number(quranStore.playbackRate))
  quranStore.playbackRate = PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]
}

const playerTitle = computed(() =>
  quranStore.surahName ? removeSurahPrefix(normalizeQuranicText(quranStore.surahName)) : 'اضغط على آية للاستماع',
)

const ayahLabel = computed(() => {
  const ayah = quranStore.currentAyah
  if (!ayah || !(ayah.ayah > 0) || !quranStore.surahName) return 'تلاوة'
  return `آية ${toArabicNumerals(ayah.ayah)}`
})

function updateMediaSession() {
  setMediaMetadata({
    title: quranStore.surahName ? normalizeQuranicText(quranStore.surahName) : 'تلاوة القرآن الكريم',
    artist: quranStore.reciter?.name || '',
  })

  setMediaHandlers({
    play: tryPlay,
    pause,
    stop,
    seekbackward: () => seekBy(-10),
    seekforward: () => seekBy(10),
    seekto: (details) => seekTo(details.seekTime),
  })
}

function updateMediaPosition() {
  setMediaPositionState({
    duration: duration.value,
    position: currentTime.value,
    playbackRate: Number(quranStore.playbackRate),
  })
}

function seekBy(delta) {
  if (audio.value) seekTo(currentTime.value + delta)
}

function seekTo(time) {
  if (!audio.value || !Number.isFinite(time)) return
  currentTime.value = Math.max(0, Math.min(time, duration.value || 0))
  quranStore.updateCurrentAyahFromTime(currentTime.value * 1000)
  updateMediaPosition()
}

async function tryPlay() {
  if (!audio.value) return
  if (radioStore.isPlaying) radioStore.stop()
  audio.value.playbackRate = Number(quranStore.playbackRate)
  // Call play() directly so autoplay rejection reaches this catch.
  try {
    await audio.value.play()
    isPlaying.value = true
    updateMediaSession()
    setMediaPlaybackState('playing')
    updateMediaPosition()
  } catch {
    isPlaying.value = false
    updateMediaSession()
    setMediaPlaybackState('paused')
  }
}

function pause() {
  if (!audio.value) return
  audio.value.pause()
  isPlaying.value = false
  setMediaPlaybackState('paused')
}

function stop() {
  audio.value?.pause()
  isPlaying.value = false
  currentTime.value = 0
  quranStore.resetAyahTracking()
  setMediaPlaybackState('paused')
}

async function togglePlayPause() {
  if (!audio.value) return
  if (isPlaying.value) {
    pause()
  } else {
    await tryPlay()
  }
}

async function seekToAyah(ayahNumber) {
  if (isPlaying.value && quranStore.currentAyah?.ayah === ayahNumber) {
    stop()
    return
  }

  const pendingAudio = audioReady
  await pendingAudio
  if (pendingAudio !== audioReady) return

  const startTime = quranStore.getAyahStartTime(ayahNumber)
  if (startTime === null || !audio.value) return

  currentTime.value = startTime
  quranStore.updateCurrentAyahFromTime(startTime * 1000)
  await tryPlay()
}

watch(currentTime, (time) => {
  if (!isPlaying.value) return
  quranStore.updateCurrentAyahFromTime(time * 1000)
  updateMediaPosition()
})

function loadSource(url) {
  if (!audio.value || !url) return
  audio.value.src = url
  audio.value.load()
  isPlaying.value = false
  currentTime.value = 0
  // Discard the previous surah's duration before new metadata arrives.
  duration.value = 0
  setMediaPlaybackState('paused')
  updateMediaPosition()
}

watch(() => quranStore.surahAudioUrl, loadSource)
onMounted(() => loadSource(quranStore.surahAudioUrl))
onUnmounted(() => {
  audio.value?.pause()

  if (!radioStore.isPlaying) clearMediaSession()
})

defineExpose({ seekToAyah })
</script>

<template>
  <div class="card">
    <div class="card-body d-flex align-items-center gap-3">
      <button
        type="button"
        @click="togglePlayPause"
        class="btn-play btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
        :disabled="loading || !quranStore.surahAudioUrl"
        :aria-label="isPlaying ? 'إيقاف تلاوة السورة' : 'تشغيل تلاوة السورة'"
      >
        <IconPlayerPlay v-if="!isPlaying" />
        <IconPlayerPause v-else />
      </button>

      <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold text-truncate text-primary">
          {{ playerTitle }}
        </div>
        <div class="small text-secondary">{{ ayahLabel }}</div>
      </div>

      <button
        type="button"
        @click="openReciterSheet"
        class="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0 player-chip"
        :title="`القارئ: ${quranStore.reciter?.name}`"
        :aria-label="`اختيار القارئ - الحالي: ${quranStore.reciter?.name}`"
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
            class="btn btn-flat btn-sm d-flex align-items-center gap-1"
            @click="cycleRate"
            :title="`سرعة التلاوة: ${rateLabel}`"
            :aria-label="`تغيير سرعة التلاوة - الحالية: ${rateLabel}`"
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
      @ended="stop"
      preload="metadata"
    ></audio>
  </div>
</template>

<style lang="scss" scoped>
.btn-play {
  width: 2.75rem;
  height: 2.75rem;
  padding: 0.625rem;
  flex-shrink: 0;
}
.player-chip {
  color: var(--bs-primary);
  background-color: var(--app-tint);
  border-radius: var(--bs-border-radius-pill);

  &:hover {
    color: var(--bs-primary);
    background-color: var(--app-tint-strong);
  }

  .text-truncate {
    max-width: 7.5rem;
  }
}

[data-bs-theme='dark'] .player-chip {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);

  &:hover {
    color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}
</style>
