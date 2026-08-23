<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useQuranStore, PLAYBACK_RATES } from '@/features/quran/store'
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause, IconMicrophone2, IconGauge } from '@tabler/icons-vue'
import { toArabicNumerals, formatTime, removeSurahPrefix, normalizeQuranicText } from '@/shared/utils/arabic'
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

// Compact title: the heading above the player already says "سورة …", so the
// prefix only eats the little width the name has next to the reciter chip.
const playerTitle = computed(() =>
  quranStore.surahName ? removeSurahPrefix(normalizeQuranicText(quranStore.surahName)) : 'اضغط على آية للاستماع',
)

const ayahLabel = computed(() => {
  const ayah = quranStore.currentAyah
  if (!ayah || !(ayah.ayah > 0) || !quranStore.surahName) return ''
  return `آية ${toArabicNumerals(ayah.ayah)}`
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
        class="btn-play btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
        :disabled="loading || !quranStore.surahAudioUrl"
      >
        <IconPlayerPlay v-if="!isPlaying" />
        <IconPlayerPause v-else />
      </button>

      <!-- Two fixed lines: the name truncates on top and the ayah line below
           keeps its height even while empty, so playback never resizes the
           player or squeezes the name. -->
      <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold text-truncate" :class="ayahLabel ? 'text-primary' : 'text-muted'">
          {{ playerTitle }}
        </div>
        <!-- nbsp keeps a real line box while idle so the indicator appearing
             doesn't change the player's height. -->
        <div class="small text-secondary">{{ ayahLabel || '\u00A0' }}</div>
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
            class="btn btn-flat btn-sm d-flex align-items-center gap-1"
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
.btn-play {
  width: 40px;
  height: 40px;
  padding: 0.625rem;
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
