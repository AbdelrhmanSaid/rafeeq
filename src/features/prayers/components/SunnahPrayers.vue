<script setup>
import { computed, ref } from 'vue'
import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { useCurrentPrayerKey } from '@/features/prayers/composables/useCurrentPrayerKey'

defineProps({
  title: { type: String, default: '' },
})

const prayers = [
  { key: 'Fajr', name: 'الفجر', before: 2, after: 0, icon: 'fajr' },
  { key: 'Dhuhr', name: 'الظهر', before: 4, after: 4, icon: 'dhuhr' },
  { key: 'Asr', name: 'العصر', before: 0, after: 0, icon: 'asr' },
  { key: 'Maghrib', name: 'المغرب', before: 0, after: 2, icon: 'maghrib' },
  { key: 'Isha', name: 'العشاء', before: 0, after: 2, icon: 'isha' },
]

// The time after sunrise has no sunnah, so Dhuhr stands in.
const currentPrayerKey = useCurrentPrayerKey()
const current = computed(() => {
  const key = currentPrayerKey.value === 'Sunrise' ? 'Dhuhr' : currentPrayerKey.value
  return prayers.find((prayer) => prayer.key === key) ?? null
})
const expanded = ref(false)
const visiblePrayers = computed(() => (expanded.value || !current.value ? prayers : [current.value]))

const formatRakaa = (value) => {
  if (value === 0) return '—'
  if (value === 2) return 'ركعتان'
  return `${toArabicNumerals(value)} ركعات`
}
</script>

<template>
  <div>
    <div class="d-flex align-items-center px-3 pb-2">
      <h2 v-if="title" class="list-title sunnah-header__title">{{ title }}</h2>
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
}

.sunnah-toggle {
  padding-block: 0.625rem;
  color: var(--app-primary-ink);
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
