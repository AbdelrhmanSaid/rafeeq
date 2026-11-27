<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Page from '@/layout/Page.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import { IconAlertTriangle } from '@tabler/icons-vue'
import PrayerTimes from '@/features/prayers/components/PrayerTimes.vue'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers.vue'
import Sebha from '@/features/sebha/components/Sebha.vue'
import RandomAyah from '@/features/quran/components/RandomAyah.vue'

// Each embed looks as it does in the app; the query only picks a location and adds a title.
const components = {
  'prayer-times': {
    component: PrayerTimes,
    props: (query) => ({ lat: toNumber(query.lat), long: toNumber(query.long) }),
  },
  'sunnah-prayers': {
    component: SunnahPrayers,
    // Its title shares a row with the قبل / بعد column labels, so it goes to the component, not above it.
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

const title = computed(() => (typeof route.query.title === 'string' ? route.query.title.trim() : ''))
const componentProps = computed(() => ({
  ...entry.value?.props?.(route.query),
  ...(entry.value?.ownsTitle && title.value ? { title: title.value } : {}),
}))
</script>

<template>
  <Page>
    <section v-if="entry">
      <!-- The app's muted section title, as on Home. -->
      <h2 v-if="title && !entry.ownsTitle" class="list-title">{{ title }}</h2>
      <component :is="entry.component" v-bind="componentProps" />
    </section>

    <!-- A wrong name in the embed code, not a failed load: say so, with no retry. -->
    <ErrorState
      v-else
      :icon="IconAlertTriangle"
      :level="1"
      title="المكوّن غير موجود"
      :message="`لا يوجد مكوّن باسم «${route.params.component}». تحقق من رابط التضمين.`"
    />
  </Page>
</template>
