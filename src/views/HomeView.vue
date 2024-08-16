<script setup>
import PageLayout from '@/components/Layout/PageLayout.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import Heading from '@/components/Heading.vue'
</script>

<template>
  <PageLayout>
    <Heading
      class="mb-4"
      title="مواقيت الصلاة"
      subtitle="سُئِلَ رسولُ اللهِ صلى الله عليه وسلم أيُّ الأعمالِ أفضلُ؟ قال: الصلاةُ في أولِ وقتِها."
    />

    <PrayerTimes />
  </PageLayout>
</template>
