<script setup>
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { IconMoonStars, IconSun } from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import HomeSection from '@/features/home/components/HomeSection.vue'
import PrayerTimes from '@/features/prayers/components/PrayerTimes.vue'
import RandomAyah from '@/features/quran/components/RandomAyah.vue'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers.vue'
import QuickAzkar from '@/features/azkar/components/QuickAzkar.vue'
import { usePrayersStore } from '@/features/prayers/store'

const prayersStore = usePrayersStore()
const now = useNow({ interval: 60_000 })

// Morning from 4 AM until noon, evening for the rest of the day.
const isMorning = computed(() => {
  const hour = now.value.getHours()
  return hour >= 4 && hour < 12
})
const greeting = computed(() => (isMorning.value ? 'صباح الخير' : 'مساء الخير'))

// The greeting carries the weekday and Gregorian date; the prayer card below keeps the Hijri date.
const today = computed(() =>
  new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(now.value),
)
</script>

<template>
  <Page>
    <h1 class="visually-hidden">رفيق — الرئيسية</h1>

    <header class="home-greeting">
      <div>
        <p class="home-greeting__title">{{ greeting }}</p>
        <p class="home-greeting__date">{{ today }}</p>
      </div>
      <span class="home-greeting__badge" aria-hidden="true">
        <component :is="isMorning ? IconSun : IconMoonStars" />
      </span>
    </header>

    <HomeSection>
      <PrayerTimes :layout="prayersStore.layout" :show-weekday="false" />
    </HomeSection>

    <HomeSection>
      <SunnahPrayers title="السنن الرواتب" />
    </HomeSection>

    <HomeSection title="آية من القرآن" :to="{ name: 'quran' }" link-label="المصحف">
      <RandomAyah />
    </HomeSection>

    <HomeSection title="الأذكار" :to="{ name: 'azkar' }">
      <QuickAzkar />
    </HomeSection>
  </Page>
</template>

<style lang="scss" scoped>
.home-greeting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.25rem 0.125rem 0.875rem;
}

/* Sun in the morning, crescent in the evening, matching the greeting. */
.home-greeting__badge {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--app-tint);
  color: var(--app-primary-ink);

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

/* Phones show no top bar on Home, so the greeting clears the status bar / notch itself. */
@media (max-width: 991.98px) {
  .home-greeting {
    padding-top: calc(env(safe-area-inset-top, 0px) + 1rem);
  }
}

[data-bs-theme='dark'] .home-greeting__badge {
  background: var(--app-tint-strong);
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.home-greeting__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
}

.home-greeting__date {
  margin: 0;
  color: var(--bs-secondary-color);
  font-size: 0.8125rem;
}
</style>
