<script setup>
import PageLayout from '@/components/Layout/PageLayout.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
</script>

<template>
  <PageLayout>
    <div class="mb-4">
      <h1>مواقيت الصلاة</h1>
      <p class="lead">سُئِلَ رسولُ اللهِ صلى الله عليه وسلم أيُّ الأعمالِ أفضلُ؟ قال: الصلاةُ في أولِ وقتِها.</p>
    </div>

    <PrayerTimes />
  </PageLayout>
</template>
