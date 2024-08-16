<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ZekrCard from '@/components/ZekrCard.vue'

import { matchNumber, toArabicNumber } from '@/utilities/arabic'

const route = useRoute()
const loading = ref(false)
const category = ref(null)
const error = ref(null)

// Watch the params of the route to fetch the data again
watch(() => route.params.category, fetchData, { immediate: true })

async function fetchData() {
  error.value = category.value = null
  loading.value = true

  try {
    const response = await fetch(`/data/azkar/${route.params.category}.json`)
    category.value = await response.json()
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
    <Heading
      class="mb-4"
      :title="category.meta.name"
      :subtitle="`باب ${category.meta.name}، عدد الأذكار في هذا الباب ${toArabicNumber(category.content.length)} ${matchNumber(category.content.length, 'ذكر', 'أذكار')}.`"
    />

    <ZekrCard
      class="mb-3"
      v-for="(zekr, index) in category.content"
      :key="index"
      :text="zekr.text"
      :repeat="zekr.repeat"
      :reference="zekr.reference"
      :benefit="zekr.benefit"
    />

    <RouterLink :to="{ name: 'azkar' }" class="btn btn-primary">
      <span>العودة للقائمة الرئيسية</span>
      <IconChevronLeft size="1.25rem" class="ms-2" />
    </RouterLink>
  </PageLayout>
</template>
