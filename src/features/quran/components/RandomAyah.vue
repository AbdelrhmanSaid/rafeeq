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
import { cn } from '@/shared/lib/utils'

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

const actionClass = 'size-11 rounded-full text-muted-foreground active:scale-90'
</script>
<template>
  <Card class="gap-0 overflow-hidden border-0 py-0 shadow-sm">
    <CardContent v-if="isFetching || isRecoveringOnReconnect" class="p-6">
      <LoadingState message="جاري تحميل آية..." />
    </CardContent>
    <CardContent v-else-if="error" class="p-6">
      <OfflineState v-if="!online" />
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." v-else />
    </CardContent>
    <template v-else-if="ayah">
      <CardContent class="px-4 pt-6 pb-4 sm:px-6">
        <p class="text-center text-3xl leading-quran font-quran sm:text-3xl" :class="tafsir ? 'mb-5' : ''">
          {{ displayText }} <span class="ayah-number">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
        </p>
        <template v-if="tafsir">
          <span class="mb-1 block text-xs font-medium text-muted-foreground">{{ tafsir.edition.name }}</span>
          <p class="text-sm leading-relaxed text-pretty text-muted-foreground">{{ tafsir.text }}</p>
        </template>
      </CardContent>
      <div class="flex items-center justify-between gap-2 border-t px-2 py-1.5">
        <span class="min-w-0 truncate ps-2 text-sm font-medium">{{ normalizeQuranicText(ayah.surah.name) }}</span>
        <div class="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            :class="actionClass"
            @click="prevAyah"
            title="الآية السابقة"
            aria-label="الآية السابقة"
          >
            <IconChevronRight class="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            :class="actionClass"
            @click="nextAyah"
            title="الآية التالية"
            aria-label="الآية التالية"
          >
            <IconChevronLeft class="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            :class="cn(actionClass, 'text-primary')"
            @click="toggleAyahPlayback"
            :disabled="!recitation?.audio"
            :title="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
            :aria-label="isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
          >
            <IconPlayerPause v-if="isPlaying" class="size-5" />
            <IconPlayerPlay v-else class="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            :class="actionClass"
            @click="fetchRandomAyah"
            title="آية جديدة"
            aria-label="تحميل آية جديدة"
          >
            <IconRefresh class="size-5" />
          </Button>
        </div>
      </div>
    </template>
  </Card>
</template>
<style scoped>
@import '@/shared/styles/quran.css';
</style>
