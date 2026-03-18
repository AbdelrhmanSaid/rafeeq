<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import Heading from '@/components/Heading.vue'
import Page from '@/components/Layout/Page.vue'
import ErrorState from '@/components/ErrorState.vue'
import { IconAlertTriangle } from '@tabler/icons-vue'

const components = {
  'prayer-times': defineAsyncComponent(() => import('@/components/PrayerTimes.vue')),
  'sunnah-prayers': defineAsyncComponent(() => import('@/components/SunnahPrayers.vue')),
  'sebha': defineAsyncComponent(() => import('@/components/Sebha.vue')),
}

const schema = {
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
}

const route = useRoute()
const component = computed(() => components[route.params.component])

const params = computed(() => {
  const result = {}

  for (const key in schema) {
    result[key] = route.query[key] ?? schema[key].default
  }

  return result
})
</script>

<template>
  <Page>
    <template v-if="component">
      <Heading v-if="params.title" :size="2" class="mb-4" :title="params.title" :subtitle="params.subtitle" />
      <component :is="component" />
    </template>

    <ErrorState v-else :icon="IconAlertTriangle" message="خطأ في الإعدادات: المكوّن غير موجود." />
  </Page>
</template>
