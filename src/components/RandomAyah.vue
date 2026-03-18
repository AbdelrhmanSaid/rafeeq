<script setup>
import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/utilities/arabic'
import { IconRefresh, IconCopy } from '@tabler/icons-vue'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import OfflineState from '@/components/OfflineState.vue'

const online = useOnline()
const loading = ref(false)
const error = ref(false)
const ayahText = ref('')
const tafsirText = ref('')
const surahName = ref('')
const ayahNumber = ref(0)
const tafsirSource = ref('')
async function fetchRandomAyah() {
  loading.value = true
  error.value = false

  try {
    const num = Math.floor(Math.random() * 6236) + 1
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${num}/editions/quran-uthmani,ar.muyassar`,
    )
    const json = await res.json()

    if (json.code === 200) {
      ayahText.value = json.data[0].text
      surahName.value = json.data[0].surah.name
      ayahNumber.value = json.data[0].numberInSurah

      tafsirText.value = json.data[1].text
      tafsirSource.value = json.data[1].edition.name
    } else {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function copyAyah() {
  const text = `${ayahText.value}\n\n﴿ ${surahName.value} - آية ${toArabicNumerals(ayahNumber.value)} ﴾`

  toast.promise(() => navigator.clipboard.writeText(text), {
    loading: 'جاري النسخ...',
    success: 'تم نسخ الآية بنجاح',
    error: 'حدث خطأ أثناء نسخ الآية',
  })
}

fetchRandomAyah()
</script>

<template>
  <div v-if="loading" class="border rounded p-5">
    <LoadingState message="جاري تحميل آية..." />
  </div>

  <div v-else-if="error" class="border rounded p-5">
    <OfflineState v-if="!online" />
    <ErrorState v-else :code="500" message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." />
  </div>

  <div v-else-if="ayahText" class="ayah-card border rounded">
    <!-- Header -->
    <div class="ayah-header">
      <span class="fw-semibold">{{ surahName }}</span>

      <div class="d-flex align-items-center gap-1">
        <button class="ayah-action-btn" @click="fetchRandomAyah" title="آية جديدة">
          <IconRefresh size="18" />
        </button>
        <button class="ayah-action-btn" @click="copyAyah" title="نسخ الآية">
          <IconCopy size="18" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="ayah-body">
      <p class="ayah-text font-quran">
        {{ ayahText }} <span class="ayah-number">{{ toArabicNumerals(ayahNumber) }}</span>
      </p>

      <div class="ayah-tafsir">
        <span class="tafsir-label">{{ tafsirSource }}</span>
        <p class="tafsir-text">{{ tafsirText }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ayah-card {
  overflow: hidden;
}

.ayah-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--bs-border-color);
  background: var(--bs-tertiary-bg);
}

.ayah-action-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  color: var(--bs-secondary-color);
  border-radius: 8px;
}

.ayah-body {
  padding: 1.5rem 1.25rem;
}

.ayah-text {
  font-size: 1.75rem;
  line-height: 2.2;
  text-align: center;
}

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

.ayah-tafsir {
  background: var(--bs-tertiary-bg);
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.tafsir-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bs-secondary-color);
  margin-bottom: 0.5rem;
}

.tafsir-text {
  font-size: 0.95rem;
  line-height: 1.9;
  margin: 0;
}
</style>
