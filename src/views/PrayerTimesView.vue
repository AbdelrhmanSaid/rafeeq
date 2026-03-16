<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import { useMeta } from '@/utilities/head'

const route = useRoute()
const isEmbedRoute = computed(() => route.path.startsWith('/embed'))

useMeta({
  title: 'مواقيت الصلاة',
  description: 'إن الصلاة كانت على المؤمنين كتابا موقوتا.',
  keywords: ['مواقيت الصلاة', 'الصلاة', 'الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'],
})
</script>

<template>
  <Page v-if="!isEmbedRoute">
    <Heading
      :size="2"
      class="mb-4"
      title="مواقيت الصلاة"
    />

    <PrayerTimes />
  </Page>

  <PrayerTimes v-else />
</template>
