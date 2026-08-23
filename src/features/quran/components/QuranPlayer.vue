<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useQuranStore, PLAYBACK_RATES } from '@/features/quran/store'
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause, IconMicrophone2, IconGauge } from '@tabler/icons-vue'
import { toArabicNumerals, formatTime } from '@/shared/utils/arabic'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import SettingsReciter from '@/features/settings/components/SettingsReciter.vue'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'

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
  <!-- The transport docks to the bottom of the screen instead of scrolling away
       with the surah, so it stays under the thumb while reading. On the phone it
       sits directly above the floating tab bar, whose footprint is the navbar
       height plus the home-indicator inset; from `md` that bar is gone and the
       player rests on the bottom edge. It stays under the tab bar's `z-40`.
       The strip spans the full width but the pill inside it is only as wide as
       the reading column, so the strip itself is click-through — otherwise its
       transparent flanks would swallow taps on whatever sits underneath (the
       desktop footer links). Only the pill takes pointer events back. -->
  <div
    class="pointer-events-none fixed inset-x-0 bottom-[calc(var(--navbar-height)_+_env(safe-area-inset-bottom,0px))] z-30 md:bottom-0 md:pb-4"
  >
    <!-- Same measure as the reading column above it. -->
    <div class="mx-auto w-full max-w-[43.75rem] px-3 pb-2 sm:px-4">
      <div class="pointer-events-auto rounded-3xl border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur-xl">
        <div class="flex items-center gap-2.5">
          <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{{ formatTime(currentTime) }}</span>

          <!-- The indicator is moved with translateX, and CSS transforms are
               never mirrored for RTL, so the whole track is flipped to keep the
               bar filling from the start edge. -->
          <Progress :model-value="progress" class="h-1 min-w-0 flex-1 -scale-x-100" />

          <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{{ formatTime(duration) }}</span>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <Button
            @click="togglePlayPause"
            size="icon"
            class="size-12 shrink-0 rounded-full shadow-sm active:scale-95"
            :disabled="loading || !quranStore.surahAudioUrl"
          >
            <IconPlayerPlay v-if="!isPlaying" class="size-5" />
            <IconPlayerPause v-else class="size-5" />
          </Button>

          <div class="min-w-0 flex-1 leading-tight">
            <template v-if="currentAyahDisplay">
              <span class="block truncate text-sm font-medium text-primary">{{ currentAyahDisplay.surahName }}</span>
              <span v-if="currentAyahDisplay.ayahNumber > 0" class="block truncate text-xs text-muted-foreground"
                >آية {{ toArabicNumerals(currentAyahDisplay.ayahNumber) }}</span
              >
            </template>
            <span v-else-if="quranStore.surahName" class="block truncate text-sm text-muted-foreground">{{
              quranStore.surahName
            }}</span>
            <span v-else class="line-clamp-2 text-xs text-muted-foreground">اضغط على آية للاستماع</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            @click="cycleRate"
            :title="`سرعة التلاوة: ${rateLabel}`"
            class="h-11 shrink-0 gap-1 rounded-full px-3 text-xs tabular-nums text-muted-foreground active:scale-95"
          >
            <IconGauge class="hidden size-4 sm:block" />
            <span>{{ rateLabel }}</span>
          </Button>

          <!-- The reciter's name only fits from `sm`; on the phone the button is
               an icon target and the name lives in its tooltip. -->
          <Button
            @click="openReciterSheet"
            variant="secondary"
            class="h-11 min-w-11 shrink-0 gap-1.5 rounded-full px-3 text-muted-foreground active:scale-95"
            :title="`القارئ: ${quranStore.reciter?.name}`"
          >
            <IconMicrophone2 class="size-5" />
            <span class="hidden max-w-32 truncate text-xs sm:inline">{{ quranStore.reciter?.name }}</span>
          </Button>
        </div>
      </div>
    </div>

    <BottomSheet :show="showReciterSheet" title="اختيار القارئ" @close="closeReciterSheet">
      <div class="px-4 pb-4">
        <SettingsReciter />
      </div>
    </BottomSheet>

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
