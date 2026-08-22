<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useQuranStore, PLAYBACK_RATES } from '@/features/quran/store'
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause, IconMicrophone2, IconGauge } from '@tabler/icons-vue'
import { toArabicNumerals, formatTime } from '@/shared/utils/arabic'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import SettingsReciter from '@/features/settings/components/SettingsReciter.vue'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
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
  <Card class="gap-0 py-0">
    <CardContent class="flex items-center gap-3 p-4">
      <Button
        @click="togglePlayPause"
        size="icon"
        class="size-10 shrink-0 rounded-full"
        :disabled="loading || !quranStore.surahAudioUrl"
      >
        <IconPlayerPlay v-if="!isPlaying" class="size-5" />
        <IconPlayerPause v-else class="size-5" />
      </Button>

      <div class="min-w-0 flex-1">
        <template v-if="currentAyahDisplay">
          <span class="me-2 inline-block font-semibold text-primary">{{ currentAyahDisplay.surahName }}</span>
          <span v-if="currentAyahDisplay.ayahNumber > 0" class="inline-block text-sm text-muted-foreground"
            >آية {{ toArabicNumerals(currentAyahDisplay.ayahNumber) }}</span
          >
        </template>
        <span v-else-if="quranStore.surahName" class="text-muted-foreground">{{ quranStore.surahName }}</span>
        <span v-else class="text-muted-foreground">اضغط على آية للاستماع</span>
      </div>

      <Button
        @click="openReciterSheet"
        variant="secondary"
        size="sm"
        class="shrink-0 text-muted-foreground hover:text-foreground"
        :title="`القارئ: ${quranStore.reciter?.name}`"
      >
        <IconMicrophone2 size="18" />
        <span class="max-w-30 truncate">{{ quranStore.reciter?.name }}</span>
      </Button>
    </CardContent>

    <BottomSheet :show="showReciterSheet" title="اختيار القارئ" @close="closeReciterSheet">
      <div class="p-4">
        <SettingsReciter />
      </div>
    </BottomSheet>

    <div class="px-4 pb-4">
      <!-- The indicator is moved with translateX, and CSS transforms are never
           mirrored for RTL, so the whole track is flipped to keep the bar
           filling from the start edge. -->
      <Progress :model-value="progress" class="h-1 -scale-x-100" />
      <div class="mt-1 flex items-center justify-between text-sm text-muted-foreground">
        <span>{{ formatTime(currentTime) }}</span>

        <div class="flex items-center gap-2">
          <span>{{ formatTime(duration) }}</span>

          <Button type="button" variant="ghost" size="sm" @click="cycleRate" :title="`سرعة التلاوة: ${rateLabel}`">
            <IconGauge size="15" />
            <span>{{ rateLabel }}</span>
          </Button>
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
  </Card>
</template>
