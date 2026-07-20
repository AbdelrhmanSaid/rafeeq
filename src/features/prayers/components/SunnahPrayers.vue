<script setup>
import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'

const prayers = [
  {
    name: 'الفجر',
    before: 2,
    after: 0,
    icon: 'fajr',
  },
  {
    name: 'الظهر',
    before: 4,
    after: 4,
    icon: 'dhuhr',
  },
  {
    name: 'العصر',
    before: 0,
    after: 0,
    icon: 'asr',
  },
  {
    name: 'المغرب',
    before: 0,
    after: 2,
    icon: 'maghrib',
  },
  {
    name: 'العشاء',
    before: 0,
    after: 2,
    icon: 'isha',
  },
]

const formatRakaa = (value) => {
  if (value === 0) return '—'
  if (value === 2) return 'ركعتان'
  return `${toArabicNumerals(value)} ركعات`
}
</script>

<template>
  <!-- Single root so class/attrs from parents (e.g. mb-5 in HomeView) still fall through -->
  <div>
    <!-- List layout (below lg) -->
    <div class="d-lg-none">
      <div class="d-flex justify-content-end px-3 pb-1 small text-body-secondary">
        <span class="rakaa-col">قبل</span>
        <span class="rakaa-col">بعد</span>
      </div>
      <div class="d-flex flex-column gap-1">
        <div
          v-for="(prayer, index) in prayers"
          :key="index"
          class="d-flex align-items-center justify-content-between px-3 py-2 rounded-2 small border"
        >
          <div class="d-flex align-items-center gap-2">
            <span class="icon-container text-secondary">
              <PrayerIcon :name="prayer.icon" />
            </span>
            <span class="fw-semibold">{{ prayer.name }}</span>
          </div>
          <div class="d-flex">
            <span class="rakaa-col fw-semibold" :class="{ 'text-body-secondary': prayer.before === 0 }">
              {{ formatRakaa(prayer.before) }}
            </span>
            <span class="rakaa-col fw-semibold" :class="{ 'text-body-secondary': prayer.after === 0 }">
              {{ formatRakaa(prayer.after) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards layout (lg and up) -->
    <div class="d-none d-lg-flex row row-cols-lg-5 g-2">
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
.rakaa-col {
  width: 4.5rem;
  text-align: center;
  flex-shrink: 0;
}
</style>
