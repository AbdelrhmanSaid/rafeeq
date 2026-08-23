<script setup>
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import PrayerTimes from '@/features/prayers/components/PrayerTimes.vue'
import RandomAyah from '@/features/quran/components/RandomAyah.vue'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers.vue'
import QuickAzkar from '@/features/azkar/components/QuickAzkar.vue'
import { usePrayersStore } from '@/features/prayers/store'

const prayersStore = usePrayersStore()
</script>

<template>
  <Page>
    <h1 class="sr-only">رفيق — الرئيسية</h1>

    <!-- The home screen is a ranked stack, not four equal blocks: the prayer
         hero leads, then the sunnah rakaa, the ayah, and the azkar shortcuts.
         `Page` sets gutters only, so the between-section rhythm lives here and
         each section's own heading supplies the gap above its content. -->
    <div class="space-y-8 md:space-y-10">
      <section>
        <Heading :size="2" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
        <PrayerTimes :vertical="prayersStore.vertical" />
      </section>

      <section>
        <Heading :size="2" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
        <SunnahPrayers />
      </section>

      <section>
        <Heading :size="2" title="آية من القرآن" subtitle="وننزل من القرآن ما هو شفاء ورحمة للمؤمنين." />
        <RandomAyah />
      </section>

      <section>
        <Heading :size="2" title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله." />
        <QuickAzkar />
      </section>
    </div>
  </Page>
</template>
