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

// Fixed-width rakaa columns so the "قبل" / "بعد" headings line up with the
// values in every row, at any font scale.
const rakaaCol = 'w-18 shrink-0 text-center text-sm'
</script>

<template>
  <!-- Single root so class/attrs from parents still fall through -->
  <div>
    <!-- The column headings sit above the card rather than inside it, so the
         card itself stays a clean list of prayers and the labels never read as
         a sixth row. -->
    <div class="mb-2 flex items-center px-4 text-xs font-medium text-muted-foreground">
      <span class="flex-1"></span>
      <span :class="rakaaCol">قبل</span>
      <span :class="rakaaCol">بعد</span>
    </div>

    <div class="divide-y overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm">
      <div v-for="(prayer, index) in prayers" :key="index" class="flex min-h-14 items-center px-4 py-3">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <span
            class="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5"
          >
            <PrayerIcon :name="prayer.icon" />
          </span>
          <span class="min-w-0 truncate text-base font-medium">{{ prayer.name }}</span>
        </div>

        <!-- A dash in muted grey says "no sunnah here" without shouting. -->
        <span :class="[rakaaCol, prayer.before === 0 ? 'text-muted-foreground' : 'font-medium']">
          {{ formatRakaa(prayer.before) }}
        </span>
        <span :class="[rakaaCol, prayer.after === 0 ? 'text-muted-foreground' : 'font-medium']">
          {{ formatRakaa(prayer.after) }}
        </span>
      </div>
    </div>
  </div>
</template>
