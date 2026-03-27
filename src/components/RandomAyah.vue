<script setup>
import { computed, ref, watch } from 'vue'
import { useFetch, useOnline } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { toArabicNumerals, removeBismillah } from '@/utilities/arabic'
import { IconRefresh, IconCopy, IconChevronRight, IconChevronLeft } from '@tabler/icons-vue'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import OfflineState from '@/components/OfflineState.vue'

// Check if the user is online
const online = useOnline()

const TOTAL_AYAHS = 6236
const current = ref(Math.floor(Math.random() * TOTAL_AYAHS) + 1)
const endpoint = computed(() => `https://api.alquran.cloud/v1/ayah/${current.value}/editions/quran-uthmani,ar.muyassar`)

const { isFetching, data, error, execute } = useFetch(endpoint, { refetch: true }).json().get()
const ayah = computed(() => data.value?.data?.[0])
const tafsir = computed(() => data.value?.data?.[1])


watch(online, (isOnline, wasOnline) => {
  if (isOnline && !wasOnline && error.value)
    execute()
})

// Remove the bismillah from the ayah text
const displayText = computed(() => (current.value !== 1 ? removeBismillah(ayah.value?.text) : ayah.value?.text))

function fetchRandomAyah() {
  current.value = Math.floor(Math.random() * TOTAL_AYAHS) + 1
}

function nextAyah() {
  current.value = current.value >= TOTAL_AYAHS ? 1 : current.value + 1
}

function prevAyah() {
  current.value = current.value <= 1 ? TOTAL_AYAHS : current.value - 1
}

function copyAyah() {
  const text = `${displayText.value}\n\n﴿ ${ayah.value?.surah.name} - آية ${toArabicNumerals(ayah.value?.numberInSurah)} ﴾`

  toast.promise(() => navigator.clipboard.writeText(text), {
    loading: 'جاري النسخ...',
    success: 'تم نسخ الآية بنجاح',
    error: 'حدث خطأ أثناء نسخ الآية',
  })
}
</script>

<template>
  <div class="card">
    <div v-if="isFetching" class="card-body p-5">
      <LoadingState message="جاري تحميل آية..." />
    </div>

    <div v-else-if="error" class="card-body p-5">
      <OfflineState v-if="!online" />
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." v-else />
    </div>

    <template v-else-if="ayah && tafsir">
      <div class="card-header d-flex align-items-center justify-content-between py-3 bg-body-tertiary">
        <span class="fw-semibold">{{ ayah.surah.name }}</span>

        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-flat" @click="prevAyah" title="الآية السابقة" aria-label="الآية السابقة">
            <IconChevronRight size="18" />
          </button>

          <button class="btn btn-flat" @click="nextAyah" title="الآية التالية" aria-label="الآية التالية">
            <IconChevronLeft size="18" />
          </button>

          <button class="btn btn-flat" @click="fetchRandomAyah" title="آية جديدة" aria-label="تحميل آية جديدة">
            <IconRefresh size="18" />
          </button>

          <button class="btn btn-flat" @click="copyAyah" title="نسخ الآية" aria-label="نسخ الآية">
            <IconCopy size="18" />
          </button>
        </div>
      </div>

      <div class="card-body">
        <p class="fs-2 text-center lh-lg font-quran mb-4">
          {{ displayText }} <span class="ayah-number">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
        </p>

        <div class="bg-body-tertiary rounded-3 p-3 px-4">
          <span class="d-block small fw-semibold text-secondary mb-2">{{ tafsir.edition.name }}</span>
          <p class="small mb-0">{{ tafsir.text }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/quran.css';
</style>
