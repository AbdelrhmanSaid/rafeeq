<script setup>
import PageLayout from '@/components/Layout/PageLayout.vue'
import Heading from '@/components/Heading.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import SunnahPrayers from '@/components/SunnahPrayers.vue'
</script>

<template>
  <PageLayout>
    <Heading
      :size="2"
      class="mb-4"
      title="مواقيت الصلاة"
      subtitle="سُئِلَ رسولُ اللهِ صلى الله عليه وسلم أيُّ الأعمالِ أفضلُ؟ قال: الصلاةُ في أولِ وقتِها."
    />

    <PrayerTimes class="mb-5" />

    <Heading :size="2" class="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />

    <SunnahPrayers class="mb-4" />
  </PageLayout>
</template>
