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
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'

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
  <Card class="gap-0 py-0">
    <CardContent v-if="isFetching || isRecoveringOnReconnect" class="p-12">
      <LoadingState message="جاري تحميل آية..." />
    </CardContent>

    <CardContent v-else-if="error" class="p-12">
      <OfflineState v-if="!online" />
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." v-else />
    </CardContent>

    <template v-else-if="ayah">
      <div class="flex items-center justify-between gap-2 border-b px-4 py-2">
        <span class="font-semibold">{{ normalizeQuranicText(ayah.surah.name) }}</span>

        <div class="flex items-center gap-1">
          <Button variant="ghost" size="icon" @click="prevAyah" title="الآية السابقة" aria-label="الآية السابقة">
            <IconChevronRight size="18" />
          </Button>

          <Button variant="ghost" size="icon" @click="nextAyah" title="الآية التالية" aria-label="الآية التالية">
            <IconChevronLeft size="18" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            @click="toggleAyahPlayback"
            :disabled="!recitation?.audio"
            :title="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
            :aria-label="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
          >
            <IconPlayerPause v-if="isPlaying" size="18" />
            <IconPlayerPlay v-else size="18" />
          </Button>

          <Button variant="ghost" size="icon" @click="fetchRandomAyah" title="آية جديدة" aria-label="تحميل آية جديدة">
            <IconRefresh size="18" />
          </Button>
        </div>
      </div>

      <CardContent class="p-4">
        <p class="text-center text-[2rem] leading-loose font-quran" :class="tafsir ? 'mb-4' : ''">
          {{ displayText }} <span class="ayah-number">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
        </p>

        <template v-if="tafsir">
          <span class="mb-2 block text-sm font-semibold text-muted-foreground">{{ tafsir.edition.name }}</span>
          <p class="text-sm">{{ tafsir.text }}</p>
        </template>
      </CardContent>
    </template>
  </Card>
</template>

<style scoped>
@import '@/shared/styles/quran.css';
</style>
