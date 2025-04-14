<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import SunnahPrayers from '@/components/SunnahPrayers.vue'
</script>

<template>
  <Page>
    <Heading :size="2" class="mb-4" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
    <PrayerTimes class="mb-5" />

    <Heading :size="2" class="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
    <SunnahPrayers class="mb-4" />
  </Page>
</template>
