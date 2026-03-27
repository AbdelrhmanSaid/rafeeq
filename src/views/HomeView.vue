<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import PrayerTimes from '@/components/PrayerTimes.vue'
import RandomAyah from '@/components/RandomAyah.vue'
import SunnahPrayers from '@/components/SunnahPrayers.vue'
import QuickAzkar from '@/components/QuickAzkar.vue'
import { usePrayersStore } from '@/stores/prayers'
import { useOnline } from '@vueuse/core'

const prayersStore = usePrayersStore()
const online = useOnline()
</script>

<template>
  <Page>
    <Heading :size="2" class="mb-4" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
    <PrayerTimes class="mb-5" :vertical="prayersStore.vertical" />

    <Heading :size="2" class="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
    <SunnahPrayers class="mb-5" />

    <template v-if="online">
      <Heading :size="2" class="mb-4" title="آية من القرآن" subtitle="وننزل من القرآن ما هو شفاء ورحمة للمؤمنين." />
      <RandomAyah class="mb-5" />
    </template>

    <Heading :size="2" class="mb-4" title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله" />
    <QuickAzkar />
  </Page>
</template>
