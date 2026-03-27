<script setup>
import { computed, ref } from 'vue'
import { useFetch } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/utilities/arabic'
import { IconRefresh, IconCopy, IconChevronRight, IconChevronLeft } from '@tabler/icons-vue'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const TOTAL_AYAHS = 6236
const currentAyahNumber = ref(Math.floor(Math.random() * TOTAL_AYAHS) + 1)
const endpoint = computed(() => `https://api.alquran.cloud/v1/ayah/${currentAyahNumber.value}/editions/quran-uthmani,ar.muyassar`)
const { isFetching, data, error } = useFetch(endpoint, { refetch: true }).json().get()
const ayahData = computed(() => data.value?.data?.[0])
const tafsirData = computed(() => data.value?.data?.[1])

// Remove the bismillah from the ayah text
const displayText = computed(() => currentAyahNumber.value !== 1 ? ayahData.value?.text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, '').trim() : ayahData.value?.text)

function fetchRandomAyah() {
  currentAyahNumber.value = Math.floor(Math.random() * TOTAL_AYAHS) + 1
}

function nextAyah() {
  currentAyahNumber.value = currentAyahNumber.value >= TOTAL_AYAHS ? 1 : currentAyahNumber.value + 1
}

function prevAyah() {
  currentAyahNumber.value = currentAyahNumber.value <= 1 ? TOTAL_AYAHS : currentAyahNumber.value - 1
}

function copyAyah() {
  const text = `${displayText.value}\n\n﴿ ${ayahData.value?.surah.name} - آية ${toArabicNumerals(ayahData.value?.numberInSurah)} ﴾`

  toast.promise(() => navigator.clipboard.writeText(text), {
    loading: 'جاري النسخ...',
    success: 'تم نسخ الآية بنجاح',
    error: 'حدث خطأ أثناء نسخ الآية',
  })
}
</script>

<template>
  <div v-if="isFetching" class="border rounded p-5">
    <LoadingState message="جاري تحميل آية..." />
  </div>

  <div v-else-if="error" class="border rounded p-5">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." />
  </div>

  <div v-else-if="ayahData && tafsirData" class="border rounded">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-body-tertiary">
      <span class="fw-semibold">{{ ayahData.surah.name }}</span>

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

    <!-- Content -->
    <div class="p-3">
      <p class="fs-2 text-center lh-lg font-quran">
        {{ displayText }} <span class="ayah-number">{{ toArabicNumerals(ayahData.numberInSurah) }}</span>
      </p>

      <div class="bg-body-tertiary rounded-3 p-3 px-4">
        <span class="d-block small fw-semibold text-secondary mb-2">{{ tafsirData.edition.name }}</span>
        <p class="small mb-0">{{ tafsirData.text }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ayah-number {
  width: 2.2rem;
  height: 2.2rem;
  margin-inline: 0.35rem 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--bs-border-color);
  border-radius: 999px;
  background-color: var(--bs-secondary-bg);
  color: var(--bs-gray-600);
  vertical-align: middle;
  font-size: 1rem;
  line-height: 1;
  font-family: 'IBM Plex Sans Arabic', sans-serif;
}
</style>
