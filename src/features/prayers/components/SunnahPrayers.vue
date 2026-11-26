<script setup>
import { computed, ref } from 'vue'
import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { useCurrentPrayerKey } from '@/features/prayers/composables/useCurrentPrayerKey'

defineProps({
  // Shown on the label row above the list, beside the قبل / بعد column labels.
  title: { type: String, default: '' },
})

const prayers = [
  {
    key: 'Fajr',
    name: 'الفجر',
    before: 2,
    after: 0,
    icon: 'fajr',
  },
  {
    key: 'Dhuhr',
    name: 'الظهر',
    before: 4,
    after: 4,
    icon: 'dhuhr',
  },
  {
    key: 'Asr',
    name: 'العصر',
    before: 0,
    after: 0,
    icon: 'asr',
  },
  {
    key: 'Maghrib',
    name: 'المغرب',
    before: 0,
    after: 2,
    icon: 'maghrib',
  },
  {
    key: 'Isha',
    name: 'العشاء',
    before: 0,
    after: 2,
    icon: 'isha',
  },
]

// Phones show only the current prayer's sunnah until expanded; the time after sunrise has none, so Dhuhr stands in.
const currentPrayerKey = useCurrentPrayerKey()
const current = computed(() => {
  const key = currentPrayerKey.value === 'Sunrise' ? 'Dhuhr' : currentPrayerKey.value
  return prayers.find((prayer) => prayer.key === key) ?? null
})
const expanded = ref(false)
// Without a location there's no current prayer to pick, so the full list shows.
const visiblePrayers = computed(() => (expanded.value || !current.value ? prayers : [current.value]))

const formatRakaa = (value) => {
  if (value === 0) return '—'
  if (value === 2) return 'ركعتان'
  return `${toArabicNumerals(value)} ركعات`
}
</script>

<template>
  <div>
    <div class="d-lg-none">
      <div class="d-flex align-items-center px-3 pb-2">
        <h2 v-if="title" class="sunnah-header__title">{{ title }}</h2>
        <div class="d-flex small text-body-secondary ms-auto">
          <span class="rakaa-col">قبل</span>
          <span class="rakaa-col">بعد</span>
        </div>
      </div>
      <div class="list-group">
        <div
          v-for="prayer in visiblePrayers"
          :key="prayer.key"
          class="list-group-item d-flex align-items-center justify-content-between sunnah-row"
        >
          <div class="d-flex align-items-center gap-2 min-w-0">
            <span class="sunnah-row__icon">
              <PrayerIcon :name="prayer.icon" />
            </span>
            <span class="fw-semibold text-truncate">{{ prayer.name }}</span>
          </div>
          <div class="d-flex small">
            <span class="rakaa-col fw-semibold" :class="{ 'text-body-secondary': prayer.before === 0 }">
              {{ formatRakaa(prayer.before) }}
            </span>
            <span class="rakaa-col fw-semibold" :class="{ 'text-body-secondary': prayer.after === 0 }">
              {{ formatRakaa(prayer.after) }}
            </span>
          </div>
        </div>
        <button
          v-if="current"
          type="button"
          class="list-group-item list-group-item-action sunnah-toggle"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'عرض أقل' : 'عرض الكل' }}
        </button>
      </div>
    </div>

    <h2 v-if="title" class="d-none d-lg-block sunnah-header__title sunnah-desktop-title">{{ title }}</h2>
    <div class="d-none d-lg-flex row row-cols-lg-5 g-2">
      <div v-for="(prayer, index) in prayers" :key="index" class="col">
        <div class="card h-100 sunnah-card">
          <div class="card-body p-3">
            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="icon-circle text-primary">
                <PrayerIcon :name="prayer.icon" />
              </span>
              <h3 class="card-title mb-0 fs-6 fw-semibold">{{ prayer.name }}</h3>
            </div>

            <div class="row g-0 text-center small">
              <div class="col-6 pe-2">
                <div class="text-body-secondary mb-1">قبل</div>
                <div class="fw-semibold" :class="{ 'text-body-secondary': prayer.before === 0 }">
                  {{ formatRakaa(prayer.before) }}
                </div>
              </div>
              <div class="col-6 ps-2 border-start">
                <div class="text-body-secondary mb-1">بعد</div>
                <div class="fw-semibold" :class="{ 'text-body-secondary': prayer.after === 0 }">
                  {{ formatRakaa(prayer.after) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sunnah-row {
  min-height: 3.5rem;
}

.sunnah-row__icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(var(--bs-secondary-rgb), 0.12);
  color: var(--bs-secondary-color);

  :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
  }
}

.sunnah-header__title {
  margin: 0;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
}

/* Desktop keeps the five separate cards, so the title sits above them like the other home section titles. */
.sunnah-desktop-title {
  margin: 0 0.125rem 0.75rem;
  color: color-mix(in srgb, var(--bs-body-color) 60%, transparent);
}

.sunnah-card {
  transition:
    transform 0.25s var(--app-ease),
    box-shadow 0.25s var(--app-ease);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--app-shadow-card-hover);
    }
  }
}

.sunnah-toggle {
  padding-block: 0.625rem;
  color: var(--bs-primary);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
}

[data-bs-theme='dark'] .sunnah-toggle {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.rakaa-col {
  width: 4.5rem;
  text-align: center;
  flex-shrink: 0;
}
</style>
