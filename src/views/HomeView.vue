<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import SunnahPrayers from '@/components/SunnahPrayers.vue'
import QuickAzkar from '@/components/QuickAzkar.vue'
</script>

<template>
  <Page>
    <Heading :size="2" class="mb-4" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
    <PrayerTimes class="mb-5" />

    <Heading :size="2" class="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
    <SunnahPrayers class="mb-5" />

    <Heading :size="2" class="mb-4" title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله" />
    <QuickAzkar />
  </Page>
</template>

<style lang="scss" scoped>
.icon-container {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-primary);
}
</style>
