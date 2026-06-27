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

const formatRate = (rate) => `${toArabicNumerals(rate).replace('.', '٫')}×`
const rateLabel = computed(() => formatRate(quranStore.playbackRate))

// The <audio> element resets playbackRate on every load, so reapply it whenever
// the rate changes or a new source is loaded.
function applyRate() {
  if (audio.value) audio.value.playbackRate = Number(quranStore.playbackRate)
}

function onCanPlay() {
  loading.value = false
  applyRate()
}

watch(() => quranStore.playbackRate, applyRate)

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

function loadSource(url) {
  if (!audio.value || !url) return
  audio.value.src = url
  audio.value.load()
  applyRate()
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

          <div class="dropup">
            <button
              type="button"
              class="speed-toggle d-flex align-items-center gap-1"
              data-bs-toggle="dropdown"
              data-bs-display="static"
              aria-expanded="false"
              :title="`سرعة التلاوة: ${rateLabel}`"
            >
              <IconGauge size="15" />
              <span>{{ rateLabel }}</span>
            </button>

            <ul class="dropdown-menu dropdown-menu-end speed-menu">
              <li v-for="rate in PLAYBACK_RATES" :key="rate">
                <button
                  type="button"
                  class="dropdown-item text-center"
                  :class="{ active: Number(quranStore.playbackRate) === rate }"
                  @click="quranStore.setPlaybackRate(rate)"
                >
                  {{ formatRate(rate) }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <audio
      ref="audio"
      @loadstart="loading = true"
      @canplay="onCanPlay"
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

// Sits on the muted time row, so it stays understated until hovered/open.
.speed-toggle {
  padding: 0.1rem 0.4rem;
  border: 0;
  border-radius: 0.5rem;
  background: none;
  color: inherit;
  font-variant-numeric: tabular-nums;

  &:hover,
  &[aria-expanded='true'] {
    color: var(--bs-body-color);
    background-color: var(--bs-secondary-bg);
  }
}

.speed-menu {
  min-width: 5rem;

  .dropdown-item {
    font-variant-numeric: tabular-nums;
  }
}
</style>
