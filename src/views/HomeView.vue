<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import SunnahPrayers from '@/components/SunnahPrayers.vue'
import QuickAzkar from '@/components/QuickAzkar.vue'
import { usePrayersStore } from '@/stores/prayers'

const prayersStore = usePrayersStore()
</script>

<template>
  <Page>
    <Heading :size="2" class="mb-4" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
    <PrayerTimes class="mb-5" :vertical="prayersStore.vertical" />

    <Heading :size="2" class="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
    <SunnahPrayers class="mb-5" />

    <Heading :size="2" class="mb-4" title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله" />
    <QuickAzkar />
  </Page>
</template>
