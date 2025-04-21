<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'
import { useFetch } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const surahId = useRouteParams('surah')
const { isFetching, data: surah, error } = useFetch(`https://api.alquran.cloud/v1/surah/${surahId.value}`).json().get()

// Prepare the ayat data
const ayat = computed(() => {
  if (surah.value) {
    let ayat = surah.value.data.ayahs

    // Remove the Basmala from the Al-Fatiha
    if (surah.value.data.number === 1) {
      ayat = ayat.slice(1)
    }

    return ayat.map((ayah) => ({
      ...ayah,

      // Remove the Basmala from the first Ayah of other Surahs
      text: ayah.numberInSurah === 1 ? ayah.text.replace('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ', '') : ayah.text,
    }))
  }

  return []
})
</script>

<template>
  <Page v-if="isFetching">
    <LoadingState />
  </Page>

  <Page v-else-if="error">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
  </Page>

  <Page class="quran-page" v-else-if="surah">
    <Heading
      class="text-center"
      :title="surah.data.name"
      :subtitle="`عدد الآيات: ${surah.data.numberOfAyahs} - ${surah.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`"
    />

    <div class="ayat font-quran mb-4">
      <span class="basmallah">بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>

      <template v-for="ayah in ayat" :key="ayah.number">
        <span class="ayah">{{ ayah.text }}</span>
        <span class="ayah-number">﴿{{ ayah.numberInSurah }}﴾</span>
      </template>
    </div>

    <RouterLink :to="{ name: 'quran' }" class="btn btn-primary">
      <IconChevronLeft size="1.25rem" />
    </RouterLink>
  </Page>
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

    .basmallah {
      display: block;
      font-size: 2rem;
      line-height: 2.5;
      text-align: center;
      margin-bottom: 1rem;
    }

    .ayah,
    .ayah-number {
      line-height: 2.125;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .ayah-number {
      padding: 0.25rem 0.5rem;
      color: var(--bs-gray-600);
      vertical-align: middle;
    }
  }
}
</style>
