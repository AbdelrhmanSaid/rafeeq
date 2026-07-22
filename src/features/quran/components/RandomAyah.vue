<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useFetch, useOnline } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { toArabicNumerals, removeBismillah, normalizeQuranicText } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'
import { IconRefresh, IconChevronRight, IconChevronLeft, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { useReconnectExecute } from '@/shared/composables/useReconnectExecute'
import { useQuranStore } from '@/features/quran/store'

import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'

// Check if the user is online
const online = useOnline()

const quranStore = useQuranStore()

const TOTAL_AYAHS = 6236
const current = ref(Math.floor(Math.random() * TOTAL_AYAHS) + 1)
const editions = computed(() => ['quran-uthmani', quranStore.currentTafseer, 'ar.alafasy'])
const endpoint = computed(() => `${API.quranCloud}/ayah/${current.value}/editions/${editions.value.join(',')}`)

const { isFetching, data, error, execute } = useFetch(endpoint, { refetch: true }).json().get()
const ayah = computed(() => data.value?.data?.[0])
const tafsir = computed(() => data.value?.data?.[1])
const recitation = computed(() => data.value?.data?.[2])
const { isRecoveringOnReconnect } = useReconnectExecute(online, execute)

const audio = new Audio()
const isPlaying = ref(false)

watch(current, () => {
  audio.pause()
  audio.currentTime = 0
  isPlaying.value = false
})

watch(recitation, (value) => {
  if (value?.audio) audio.src = value.audio
})

audio.addEventListener('play', () => {
  isPlaying.value = true
})

audio.addEventListener('pause', () => {
  isPlaying.value = false
})

audio.addEventListener('ended', () => {
  isPlaying.value = false
})

onUnmounted(() => {
  audio.pause()
  audio.currentTime = 0
})

const displayText = computed(() => {
  if (!ayah.value?.text) return ''

  if (ayah.value.surah.number !== 1 && ayah.value.numberInSurah === 1) {
    return removeBismillah(ayah.value.text)
  }

  return ayah.value.text.trim()
})

function fetchRandomAyah() {
  current.value = Math.floor(Math.random() * TOTAL_AYAHS) + 1
}

function nextAyah() {
  current.value = current.value >= TOTAL_AYAHS ? 1 : current.value + 1
}

function prevAyah() {
  current.value = current.value <= 1 ? TOTAL_AYAHS : current.value - 1
}

async function toggleAyahPlayback() {
  if (!recitation.value?.audio) return

  if (isPlaying.value) {
    audio.pause()
    return
  }

  try {
    await audio.play()
  } catch {
    toast.error('تعذر تشغيل التلاوة، برجاء المحاولة مرة أخرى')
  }
}
</script>

<template>
  <div class="card">
    <div v-if="isFetching || isRecoveringOnReconnect" class="card-body p-5">
      <LoadingState message="جاري تحميل آية..." />
    </div>

    <div v-else-if="error" class="card-body p-5">
      <OfflineState v-if="!online" />
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." v-else />
    </div>

    <template v-else-if="ayah">
      <div class="card-header d-flex align-items-center justify-content-between py-2">
        <span class="fw-semibold">{{ normalizeQuranicText(ayah.surah.name) }}</span>

        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-flat btn-icon" @click="prevAyah" title="الآية السابقة" aria-label="الآية السابقة">
            <IconChevronRight size="18" />
          </button>

          <button class="btn btn-flat btn-icon" @click="nextAyah" title="الآية التالية" aria-label="الآية التالية">
            <IconChevronLeft size="18" />
          </button>

          <button
            class="btn btn-flat btn-icon"
            @click="toggleAyahPlayback"
            :disabled="!recitation?.audio"
            :title="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
            :aria-label="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
          >
            <IconPlayerPause v-if="isPlaying" size="18" />
            <IconPlayerPlay v-else size="18" />
          </button>

          <button class="btn btn-flat btn-icon" @click="fetchRandomAyah" title="آية جديدة" aria-label="تحميل آية جديدة">
            <IconRefresh size="18" />
          </button>
        </div>
      </div>

      <div class="card-body">
        <p class="fs-2 text-center lh-lg font-quran" :class="tafsir ? 'mb-4' : 'mb-0'">
          {{ displayText }} <span class="ayah-number">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
        </p>

        <template v-if="tafsir">
          <span class="d-block small fw-semibold text-secondary mb-2">{{ tafsir.edition.name }}</span>
          <p class="small mb-0">{{ tafsir.text }}</p>
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import '@/shared/styles/quran.css';
</style>
