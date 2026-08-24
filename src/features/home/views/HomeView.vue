<script setup>
import { ref } from 'vue'
import { IconRefresh } from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import HomeSection from '@/features/home/components/HomeSection.vue'
import InstallBanner from '@/app/pwa/InstallBanner.vue'
import PrayerTimes from '@/features/prayers/components/PrayerTimes.vue'
import RandomAyah from '@/features/quran/components/RandomAyah.vue'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers.vue'
import QuickAzkar from '@/features/azkar/components/QuickAzkar.vue'
import { usePrayersStore } from '@/features/prayers/store'
import { usePullToRefresh } from '@/shared/composables/usePullToRefresh'

const prayersStore = usePrayersStore()

const prayerTimesRef = ref(null)
const { pull, refreshing, progress } = usePullToRefresh(async () => {
  await prayerTimesRef.value?.refresh()
})
</script>

<template>
  <Page>
    <h1 class="visually-hidden">رفيق — الرئيسية</h1>

    <!-- Pull-to-refresh indicator: slides down from under the top chrome. -->
    <div
      class="ptr-indicator"
      :class="{ 'is-visible': pull > 8 || refreshing }"
      :style="{ transform: `translateY(${pull}px)` }"
      aria-hidden="true"
    >
      <span v-if="refreshing" class="spinner-border spinner-border-sm text-primary"></span>
      <IconRefresh v-else size="1.1rem" class="text-primary" :style="{ transform: `rotate(${progress * 180}deg)` }" />
    </div>

    <InstallBanner />

    <HomeSection title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا.">
      <PrayerTimes ref="prayerTimesRef" :vertical="prayersStore.vertical" />
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

<style lang="scss" scoped>
.ptr-indicator {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 4px);
  left: 50%;
  margin-left: -1.25rem;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--bs-body-bg);
  box-shadow: var(--bs-box-shadow);
  border: 1px solid var(--app-hairline);
  opacity: 0;
  z-index: 1040;
  pointer-events: none;
  transition: opacity 0.15s ease-out;

  &.is-visible {
    opacity: 1;
  }
}
</style>
