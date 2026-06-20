<script setup>
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import PrayerTimes from '@/features/prayers/PrayerTimes.vue'
import RandomAyah from '@/features/quran/RandomAyah.vue'
import SunnahPrayers from '@/features/prayers/SunnahPrayers.vue'
import QuickAzkar from '@/features/azkar/QuickAzkar.vue'
import { usePrayersStore } from '@/features/prayers/store'

const prayersStore = usePrayersStore()
</script>

<template>
  <Page>
    <Heading :size="2" class="mb-4" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
    <PrayerTimes class="mb-5" :vertical="prayersStore.vertical" />

    <Heading :size="2" class="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
    <SunnahPrayers class="mb-5" />

    <Heading :size="2" class="mb-4" title="آية من القرآن" subtitle="وننزل من القرآن ما هو شفاء ورحمة للمؤمنين." />
    <RandomAyah class="mb-5" />

    <Heading :size="2" class="mb-4" title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله" />
    <QuickAzkar />
  </Page>
</template>
