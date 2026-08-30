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

// Render settings cards (the reciter picker) form-only inside the sheet — the
// sheet provides its own title, so the card chrome would be redundant.
provide('settings-bare', true)

const quranStore = useQuranStore()
const radioStore = useRadioStore()

// Timings (and the derived audio URL) stay off the page loader. Recite waits
// on this so a tap before timings arrive still seeks once they do.
let audioReady = Promise.resolve()

const trackAudioLoad = (promise) => (audioReady = promise ?? Promise.resolve())

watch(
  () => [props.surahNumber, props.surahName],
  ([surahNumber, surahName]) => trackAudioLoad(quranStore.loadSurahAudio(surahNumber, surahName)),
  { immediate: true },
)

const audio = ref(null)
// loadstart → canplay window; useMediaControls' `waiting` also flips during
// mid-play buffering, which would disable the button, so this stays manual.
const loading = ref(false)
// Manual for the same reason: useMediaControls' `playing` also flips false on
// 'waiting'/'loadstart', which would break pausing mid-buffer. Only explicit
// play/pause/stop/loadSource change it.
const isPlaying = ref(false)
const { currentTime, duration } = useMediaControls(audio)

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
    trackAudioLoad(quranStore.reloadSurahAudio())
  }
}

const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))

const rateLabel = computed(() => `${toArabicNumerals(quranStore.playbackRate).replace('.', '٫')}×`)

// Advance to the next speed preset, wrapping back to the slowest at the end.
function cycleRate() {
  const i = PLAYBACK_RATES.indexOf(Number(quranStore.playbackRate))
  quranStore.playbackRate = PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]
}

// Compact title: the heading above the player already says "سورة …", so the
// prefix only eats the little width the name has next to the reciter chip.
const playerTitle = computed(() =>
  quranStore.surahName ? removeSurahPrefix(normalizeQuranicText(quranStore.surahName)) : 'اضغط على آية للاستماع',
)

const ayahLabel = computed(() => {
  const ayah = quranStore.currentAyah
  if (!ayah || !(ayah.ayah > 0) || !quranStore.surahName) return 'تلاوة'
  return `آية ${toArabicNumerals(ayah.ayah)}`
})

// Lockscreen / notification player. Position state feeds the OS seekbar, so
// refresh it whenever time, duration, or rate changes.
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
  // Writing the ref seeks the element via useMediaControls.
  currentTime.value = Math.max(0, Math.min(time, duration.value || 0))
  quranStore.updateCurrentAyahFromTime(currentTime.value * 1000)
  updateMediaPosition()
}

async function tryPlay() {
  if (!audio.value) return
  if (radioStore.isPlaying) radioStore.stop()
  // The browser resets playbackRate on every source load, so set it before play.
  audio.value.playbackRate = Number(quranStore.playbackRate)
  // Call play() directly so autoplay rejection lands in this catch; isPlaying
  // is set manually below rather than from media events.
  try {
    await audio.value.play()
    isPlaying.value = true
    updateMediaSession()
    setMediaPlaybackState('playing')
    updateMediaPosition()
  } catch {
    isPlaying.value = false
    // The radio's session was already cleared above — leave a valid paused
    // Quran session rather than no lockscreen player at all.
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
  // Setting the ref after isPlaying is false also rewinds the element without
  // re-triggering the ayah sync below.
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

// useMediaControls keeps currentTime synced from the element's timeupdate;
// mirror it into the ayah highlight and the OS seekbar while playing.
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
  // Until the new metadata arrives the previous surah's duration would clamp
  // lockscreen seeks and feed the OS seekbar — zero it alongside the position.
  duration.value = 0
  setMediaPlaybackState('paused')
  updateMediaPosition()
}

watch(() => quranStore.surahAudioUrl, loadSource)
onMounted(() => loadSource(quranStore.surahAudioUrl))
onUnmounted(() => {
  audio.value?.pause()

  // Leave the lockscreen player only if the radio hasn't taken it over.
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

      <!-- Two fixed lines: the name truncates on top and the ayah line below
           always has text ('تلاوة' while idle), so playback never resizes the
           player or squeezes the name. -->
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
  /* 44px minimum touch target. */
  width: 2.75rem;
  height: 2.75rem;
  padding: 0.625rem;
  flex-shrink: 0;
}
/* Same soft primary-tint language as .chip, instead of the gray secondary pair. */
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
