<script setup>
import Page from '@/layout/Page.vue'
import HomeSection from '@/features/home/components/HomeSection.vue'
import PrayerTimes from '@/features/prayers/components/PrayerTimes.vue'
import RandomAyah from '@/features/quran/components/RandomAyah.vue'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers.vue'
import QuickAzkar from '@/features/azkar/components/QuickAzkar.vue'
import { usePrayersStore } from '@/features/prayers/store'

const prayersStore = usePrayersStore()
</script>

<template>
  <Page>
    <h1 class="visually-hidden">رفيق — الرئيسية</h1>

    <HomeSection title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا.">
      <PrayerTimes :vertical="prayersStore.vertical" />
    </HomeSection>

    <HomeSection title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه.">
      <SunnahPrayers />
    </HomeSection>

    <HomeSection title="آية من القرآن" subtitle="وننزل من القرآن ما هو شفاء ورحمة للمؤمنين.">
      <RandomAyah />
    </HomeSection>

    <HomeSection title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله.">
      <QuickAzkar />
    </HomeSection>
  </Page>
</template>
