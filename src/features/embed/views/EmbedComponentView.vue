<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Heading from '@/shared/ui/Heading.vue'
import Page from '@/layout/Page.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import { IconAlertTriangle } from '@tabler/icons-vue'
import PrayerTimes from '@/features/prayers/components/PrayerTimes.vue'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers.vue'
import Sebha from '@/features/sebha/components/Sebha.vue'
import RandomAyah from '@/features/quran/components/RandomAyah.vue'

const components = {
  'prayer-times': {
    component: PrayerTimes,
    props: (query) => ({ lat: toNumber(query.lat), long: toNumber(query.long) }),
  },
  'sunnah-prayers': {
    component: SunnahPrayers,
    // Its title shares a row with the قبل / بعد labels, so it is passed as a prop instead of a heading.
    ownsTitle: true,
  },
  'sebha': {
    component: Sebha,
  },
  'random-ayah': {
    component: RandomAyah,
  },
}

function toNumber(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const route = useRoute()
const entry = computed(() => components[route.params.component])

const queryText = (key) => (typeof route.query[key] === 'string' ? route.query[key].trim() : '')
const title = computed(() => queryText('title'))
const subtitle = computed(() => queryText('subtitle'))
const componentProps = computed(() => ({
  ...entry.value?.props?.(route.query),
  ...(entry.value?.ownsTitle && title.value ? { title: title.value } : {}),
}))
</script>

<template>
  <Page>
    <section v-if="entry">
      <Heading
        v-if="title && !entry.ownsTitle"
        :size="2"
        class="mb-4"
        :title="title"
        :subtitle="subtitle || undefined"
      />
      <component :is="entry.component" v-bind="componentProps" />
    </section>

    <ErrorState
      v-else
      :icon="IconAlertTriangle"
      :level="1"
      title="المكوّن غير موجود"
      :message="`لا يوجد مكوّن باسم «${route.params.component}». تحقق من رابط التضمين.`"
    />
  </Page>
</template>
