<script setup>
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

    <div class="ayat mb-4">
      <template v-for="ayah in surah.data.ayahs" :key="ayah.number">
        <span class="ayah font-quran">{{ ayah.text }}</span>
        <span class="ayah-number font-quran">﴿{{ ayah.numberInSurah }}﴾</span>
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
