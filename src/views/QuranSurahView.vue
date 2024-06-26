<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'
import { matchNumber, toArabicNumber } from '@/utilities/arabic'

import PageLayout from '@/components/Layout/PageLayout.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const route = useRoute()
const loading = ref(false)
const surah = ref(null)
const error = ref(null)

// Watch the params of the route to fetch the data again
watch(() => route.params.surah, fetchData, { immediate: true })

async function fetchData() {
  error.value = surah.value = null
  loading.value = true

  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${route.params.surah}`)
    surah.value = await response.json()
    surah.value = surah.value.data
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageLayout v-if="loading">
    <LoadingState />
  </PageLayout>

  <PageLayout v-else-if="error">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
  </PageLayout>

  <PageLayout class="quran-page" v-else>
    <div class="mb-4 text-center">
      <h1>{{ toArabicNumber(surah.number) }}. {{ surah.name }}</h1>
      <p class="lead">
        {{ toArabicNumber(surah.numberOfAyahs) }} {{ matchNumber(surah.numberOfAyahs, 'آية', 'آيات') }}
        -
        {{ surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }}
      </p>
    </div>

    <div class="ayat mb-4">
      <template v-for="ayah in surah.ayahs" :key="ayah.number">
        <span class="ayah font-quran">{{ ayah.text }}</span>
        <span class="ayah-number font-quran">﴿{{ toArabicNumber(ayah.numberInSurah) }}﴾</span>
      </template>
    </div>

    <RouterLink :to="{ name: 'quran' }" class="btn btn-primary">
      <IconChevronLeft size="1.25rem" />
    </RouterLink>
  </PageLayout>
</template>

<style lang="scss" scoped>
.quran-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  max-width: 700px;

  .ayat {
    padding: 1rem;
    border-radius: 5px;
    text-align: justify;
    border: 1px solid var(--bs-border-color);

    span {
      line-height: 2.125;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .ayah-number {
      padding: 0.25rem 0.5rem;
      padding-inline-start: 0;
      color: var(--bs-gray-600);
      vertical-align: middle;
    }
  }
}
</style>
