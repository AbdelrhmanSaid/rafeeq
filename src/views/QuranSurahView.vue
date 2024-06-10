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

  <PageLayout v-else>
    <div class="mb-4">
      <h1>{{ toArabicNumber(surah.number) }}. {{ surah.name }}</h1>
      <p class="lead">
        {{ toArabicNumber(surah.numberOfAyahs) }} {{ matchNumber(surah.numberOfAyahs, 'آية', 'آيات') }}
        -
        {{ surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية' }}
      </p>
    </div>

    <div v-for="ayah in surah.ayahs" :key="ayah.number">
      <div class="ayah card font-Noto-Naskh-Arabic">
        <div class="card-body">
          <span v-html="ayah.text" />
          <span class="ayah-number">﴿{{ toArabicNumber(ayah.numberInSurah) }}﴾</span>
        </div>
      </div>
    </div>

    <RouterLink :to="{ name: 'quran' }" class="btn btn-primary">
      <span>العودة للقائمة الرئيسية</span>
      <IconChevronLeft size="1.25rem" class="ms-2" />
    </RouterLink>
  </PageLayout>
</template>

<style lang="scss" scoped>
.ayah {
  line-height: 2;
  font-size: 1.25rem;
  text-align: justify;
  margin-bottom: 1rem;
}
</style>
