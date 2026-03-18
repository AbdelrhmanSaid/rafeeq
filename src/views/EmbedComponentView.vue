<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import Heading from '@/components/Heading.vue'
import Page from '@/components/Layout/Page.vue'
import ErrorState from '@/components/ErrorState.vue'
import { IconAlertTriangle } from '@tabler/icons-vue'

const schema = {
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
}

const components = {
  'prayer-times': {
    component: defineAsyncComponent(() => import('@/components/PrayerTimes.vue')),
    schema: {
      lat: { type: Number, default: null },
      long: { type: Number, default: null },
    },
  },
  'sunnah-prayers': {
    component: defineAsyncComponent(() => import('@/components/SunnahPrayers.vue')),
  },
  'sebha': {
    component: defineAsyncComponent(() => import('@/components/Sebha.vue')),
  },
}

function resolveProps(schema, query) {
  const result = {}

  for (const key in schema) {
    const raw = query[key]
    const { type, default: defaultValue } = schema[key]

    if (raw == null) {
      result[key] = defaultValue
      continue
    }

    if (type === Number) result[key] = Number(raw)
    else if (type === Boolean) result[key] = raw !== 'false' && raw !== '0'
    else result[key] = raw
  }

  return result
}

const route = useRoute()
const entry = computed(() => components[route.params.component])
const component = computed(() => entry.value?.component)

const props = computed(() => resolveProps(schema, route.query))
const componentProps = computed(() => resolveProps(entry.value?.schema ?? {}, route.query))
</script>

<template>
  <Page>
    <template v-if="component">
      <Heading v-if="props.title" :size="2" class="mb-4" :title="props.title" :subtitle="props.subtitle" />
      <component :is="component" v-bind="componentProps" />
    </template>

    <ErrorState v-else :icon="IconAlertTriangle" message="خطأ في الإعدادات: المكوّن غير موجود." />
  </Page>
</template>
