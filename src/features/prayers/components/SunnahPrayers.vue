<script setup>
import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'
import { Card, CardContent } from '@/shared/components/ui/card'
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
// values in every row.
const rakaaCol = 'w-18 shrink-0 text-center'
</script>

<template>
  <!-- Single root so class/attrs from parents (e.g. mb-10 in HomeView) still fall through -->
  <div>
    <!-- List layout (below lg) -->
    <div class="lg:hidden">
      <div class="flex justify-end px-3 pb-1 text-sm text-muted-foreground">
        <span :class="rakaaCol">قبل</span>
        <span :class="rakaaCol">بعد</span>
      </div>
      <div class="flex flex-col gap-1">
        <div
          v-for="(prayer, index) in prayers"
          :key="index"
          class="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
        >
          <div class="flex items-center gap-2">
            <!-- Match the icon sizing of the prayer times list rows. -->
            <span class="grid size-6 shrink-0 place-items-center text-muted-foreground [&_svg]:size-[1.15rem]">
              <PrayerIcon :name="prayer.icon" />
            </span>
            <span class="font-semibold">{{ prayer.name }}</span>
          </div>
          <div class="flex">
            <span class="font-semibold" :class="[rakaaCol, { 'text-muted-foreground': prayer.before === 0 }]">
              {{ formatRakaa(prayer.before) }}
            </span>
            <span class="font-semibold" :class="[rakaaCol, { 'text-muted-foreground': prayer.after === 0 }]">
              {{ formatRakaa(prayer.after) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards layout (lg and up) -->
    <div class="hidden gap-2 lg:grid lg:grid-cols-5">
      <Card v-for="(prayer, index) in prayers" :key="index" class="h-full gap-0 py-0">
        <CardContent class="p-3">
          <div class="mb-3 flex items-center gap-2">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-full border text-muted-foreground [&_svg]:size-[1.15rem]"
            >
              <PrayerIcon :name="prayer.icon" />
            </span>
            <h3 class="text-base font-semibold">{{ prayer.name }}</h3>
          </div>

          <div class="grid grid-cols-2 text-center text-sm">
            <div class="pe-2">
              <div class="mb-1 text-muted-foreground">قبل</div>
              <div class="font-semibold" :class="{ 'text-muted-foreground': prayer.before === 0 }">
                {{ formatRakaa(prayer.before) }}
              </div>
            </div>
            <div class="border-s ps-2">
              <div class="mb-1 text-muted-foreground">بعد</div>
              <div class="font-semibold" :class="{ 'text-muted-foreground': prayer.after === 0 }">
                {{ formatRakaa(prayer.after) }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
