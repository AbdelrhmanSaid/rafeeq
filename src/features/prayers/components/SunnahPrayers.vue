<script setup>
import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'

const prayers = [
  {
    name: 'الفجر',
    before: 2,
    after: '-',
    icon: 'fajr',
  },
  {
    name: 'الظهر',
    before: 4,
    after: 4,
    icon: 'dhuhr',
  },
  {
    name: 'المغرب',
    before: '-',
    after: 2,
    icon: 'maghrib',
  },
  {
    name: 'العشاء',
    before: '-',
    after: 2,
    icon: 'isha',
  },
]

const formatRakaa = (value) => {
  if (value === '-') return '—'
  if (value === 2) return 'ركعتان'
  return `${toArabicNumerals(value)} ركعات`
}
</script>

<template>
  <div class="row row-cols-2 row-cols-lg-4 g-2">
    <div v-for="(prayer, index) in prayers" :key="index" class="col">
      <div class="card h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="icon-circle text-secondary">
              <PrayerIcon :name="prayer.icon" />
            </span>
            <h3 class="card-title mb-0 fs-6 fw-semibold">{{ prayer.name }}</h3>
          </div>

          <div class="row g-0 text-center small">
            <div class="col-6 pe-2">
              <div class="text-body-secondary mb-1">قبل</div>
              <div class="fw-semibold" :class="{ 'text-body-secondary': prayer.before === '-' }">
                {{ formatRakaa(prayer.before) }}
              </div>
            </div>
            <div class="col-6 ps-2 border-start">
              <div class="text-body-secondary mb-1">بعد</div>
              <div class="fw-semibold" :class="{ 'text-body-secondary': prayer.after === '-' }">
                {{ formatRakaa(prayer.after) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
