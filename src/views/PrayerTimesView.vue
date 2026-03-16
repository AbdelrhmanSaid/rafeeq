<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import { useMeta } from '@/utilities/head'

useMeta({
  title: 'مواقيت الصلاة',
  description: 'إن الصلاة كانت على المؤمنين كتابا موقوتا.',
  keywords: ['مواقيت الصلاة', 'الصلاة', 'الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'],
})
</script>

<template>
  <Page>
    <Heading :size="2" class="mb-4" title="مواقيت الصلاة" />

    <PrayerTimes />
  </Page>
</template>
