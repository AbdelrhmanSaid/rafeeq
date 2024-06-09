<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ZekrCard from '@/components/ZekrCard.vue'

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
    const response = await fetch(`/data/hisn-al-muslim/${route.params.category}.json`)
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
    <div class="mb-4">
      <h1>{{ category.meta.name }}</h1>
      <p class="lead">باب {{ category.meta.name }}، عدد الأذكار في هذا الباب {{ category.content.length }} أذكار.</p>
    </div>

    <ZekrCard class="mb-3" v-for="zekr in category.content" :key="zekr.id" :text="zekr.text" :repeat="zekr.repeat" />

    <RouterLink :to="{ name: 'hisn-al-muslim' }" class="btn btn-primary">
      <span>العودة للقائمة الرئيسية</span>
      <IconChevronLeft size="1.25rem" class="ms-2" />
    </RouterLink>
  </PageLayout>
</template>
