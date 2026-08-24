<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useFetch, useMediaControls, useOnline } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { toArabicNumerals, removeBismillah, normalizeQuranicText } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'
import {
  IconRefresh,
  IconChevronRight,
  IconChevronLeft,
  IconPlayerPlay,
  IconPlayerPause,
  IconBookmark,
} from '@tabler/icons-vue'
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
const { playing: isPlaying, currentTime } = useMediaControls(audio, {
  src: () => recitation.value?.audio,
})

watch(current, () => {
  isPlaying.value = false
  currentTime.value = 0
})

onUnmounted(() => {
  // The component's effect scope is already stopped here, so act on the
  // element directly instead of the useMediaControls refs.
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
    isPlaying.value = false
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
  <div class="card ayah-card">
    <div v-if="isFetching || isRecoveringOnReconnect" class="card-body p-5">
      <LoadingState message="جاري تحميل آية..." />
    </div>

    <div v-else-if="error" class="card-body p-5">
      <OfflineState v-if="!online" />
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." v-else />
    </div>

    <template v-else-if="ayah">
      <div class="ayah-toolbar">
        <span class="chip ayah-surah">
          <IconBookmark size="14" aria-hidden="true" />
          <span>{{ normalizeQuranicText(ayah.surah.name) }}</span>
          <span class="ayah-surah__sep" aria-hidden="true">·</span>
          <span>آية {{ toArabicNumerals(ayah.numberInSurah) }}</span>
        </span>

        <div class="ayah-actions">
          <button class="btn btn-flat btn-icon" @click="prevAyah" title="الآية السابقة" aria-label="الآية السابقة">
            <IconChevronRight size="18" />
          </button>

          <button class="btn btn-flat btn-icon" @click="nextAyah" title="الآية التالية" aria-label="الآية التالية">
            <IconChevronLeft size="18" />
          </button>

          <button class="btn btn-flat btn-icon" @click="fetchRandomAyah" title="آية جديدة" aria-label="تحميل آية جديدة">
            <IconRefresh size="18" />
          </button>

          <button
            class="btn btn-flat btn-icon ayah-play"
            :class="{ 'is-playing': isPlaying }"
            @click="toggleAyahPlayback"
            :disabled="!recitation?.audio"
            :title="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
            :aria-label="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
          >
            <IconPlayerPause v-if="isPlaying" size="18" />
            <IconPlayerPlay v-else size="18" />
          </button>
        </div>
      </div>

      <div class="card-body pt-3">
        <p class="ayah-text font-quran">
          {{ displayText }} <span class="ayah-number">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
        </p>

        <div v-if="tafsir" class="ayah-tafsir">
          <span class="ayah-tafsir__label">{{ tafsir.edition.name }}</span>
          <p class="mb-0">{{ tafsir.text }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import '@/shared/styles/quran.css';

.ayah-card {
  position: relative;
  overflow: hidden;
  background: radial-gradient(30rem 12rem at 50% -4rem, var(--app-tint), transparent 70%), var(--app-surface);
}

.ayah-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem 0;
}

.ayah-surah {
  min-width: 0;
  font-family: 'Thmanyah Serif Text', 'Thmanyah Sans', serif;
  font-size: 0.85rem;
}

.ayah-surah__sep {
  opacity: 0.5;
}

.ayah-actions {
  display: flex;
  align-items: center;
  gap: 0.1rem;

  .btn {
    /* 44px minimum touch target. */
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    color: var(--bs-secondary-color);
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--app-tint);
      color: var(--bs-primary);
    }
  }
}

/* Play is the toolbar's primary action — give it a standing tint so it
   doesn't read as one of four equal icons. */
.ayah-play:not(:disabled) {
  background-color: var(--app-tint);
  color: var(--bs-primary);
}

.ayah-play.is-playing {
  background-color: var(--bs-primary);
  color: #fff;

  &:hover {
    background-color: var(--bs-primary) !important;
    color: #fff !important;
  }
}

.ayah-text {
  margin: 0;
  padding-inline: 0.5rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 2;
  text-align: center;
}

.ayah-tafsir {
  margin-top: 1.25rem;
  padding: 1rem 1.15rem;
  border-radius: var(--bs-border-radius);
  background: color-mix(in srgb, var(--bs-primary) 5%, var(--bs-body-bg));
  border: 1px solid var(--app-hairline);
  font-size: 0.9rem;
  line-height: 1.9;
}

.ayah-tafsir__label {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: var(--bs-primary);
  font-size: 0.8rem;
  font-weight: 700;
}
</style>
