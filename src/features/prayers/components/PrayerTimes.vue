<script setup>
import { computed } from 'vue'
import { usePrayersStore } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/composables/usePrayerLocation'
import { useFetch, useDateFormat, useOnline, useNow } from '@vueuse/core'
import { useReconnectExecute } from '@/shared/composables/useReconnectExecute'

import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'
import { Card, CardContent } from '@/shared/components/ui/card'
import { formatTime, toArabicNumerals } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'
import { CALCULATION_FIELDS } from '@/features/prayers/constants/calculationOptions'

import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'

const props = defineProps({
  lat: { type: [Number, String], default: null },
  long: { type: [Number, String], default: null },
  vertical: { type: Boolean, default: false },
})

const hasPropsCoords = computed(() => props.lat != null && props.long != null)

// Reactive state for current time
const now = useNow()

// Check if the user is online
const online = useOnline()

// Prayer timings map
const timingsMap = {
  Fajr: { label: 'الفجر', icon: 'fajr' },
  Sunrise: { label: 'الشروق', icon: 'sunrise' },
  Dhuhr: { label: 'الظهر', icon: 'dhuhr' },
  Asr: { label: 'العصر', icon: 'asr' },
  Maghrib: { label: 'المغرب', icon: 'maghrib' },
  Isha: { label: 'العشاء', icon: 'isha' },
}

const store = usePrayersStore()
const { detect } = usePrayerLocation()

const latitude = computed(() => (hasPropsCoords.value ? props.lat : store.latitude))
const longitude = computed(() => (hasPropsCoords.value ? props.long : store.longitude))

// API endpoint
const endpoint = computed(() => {
  if (!latitude.value || !longitude.value) return null
  const today = new Date().toISOString().split('T')[0].split('-').reverse().join('-')

  const params = new URLSearchParams({
    latitude: latitude.value,
    longitude: longitude.value,
    iso8601: 'true',
  })

  for (const { key, param } of CALCULATION_FIELDS) {
    const value = store[key]
    if (value) params.append(param, value)
  }

  return `${API.aladhan}/timings/${today}?${params.toString()}`
})

// Fetch options
const options = {
  refetch: true,
  beforeFetch: ({ url, cancel }) => {
    if (!url) cancel()
  },
}

// Fetch prayer timings
const { isFetching, data: timings, error, execute } = useFetch(endpoint, options).json().get()
const { isRecoveringOnReconnect } = useReconnectExecute(online, execute)

// Format time
const formatTiming = (time) => {
  return toArabicNumerals(useDateFormat(time, 'hh:mm A').value.replace('AM', 'ص').replace('PM', 'م'))
}

// Hijri date from API response
const hijriDate = computed(() => {
  let date = timings.value?.data?.date?.hijri
  if (!date) return ''
  return toArabicNumerals(`${date.day} ${date.month.ar} ${date.year}`)
})

const hijriDay = computed(() => timings.value?.data?.date?.hijri?.weekday?.ar ?? '')

// Determine the next prayer
const nextPrayerKey = computed(() => {
  if (!timings.value?.data?.timings) return null

  const prayerTimes = timings.value.data.timings
  const currentTime = now.value.getTime()

  const prayers = Object.entries(timingsMap).map(([name]) => ({
    name,
    time: new Date(prayerTimes[name]).getTime(),
  }))

  for (let i = 0; i < prayers.length - 1; i++) {
    if (currentTime >= prayers[i].time && currentTime < prayers[i + 1].time) {
      return prayers[i + 1].name
    }
  }

  return currentTime >= prayers[prayers.length - 1].time || currentTime < prayers[0].time ? prayers[0].name : null
})

// Calculate remaining time until next prayer
const remainingTime = computed(() => {
  if (!timings.value?.data?.timings || !nextPrayerKey.value) return null

  let nextPrayerTime = new Date(timings.value.data.timings[nextPrayerKey.value])
  const currentTime = now.value

  // If next prayer time is before current time, add 1 day (24 hours)
  if (nextPrayerTime < currentTime) {
    nextPrayerTime.setDate(nextPrayerTime.getDate() + 1)
  }

  return formatTime((nextPrayerTime - currentTime) / 1000)
})

// Reserve room for loading / detect / error states so the swap to loaded
// content doesn't shift the page.
const stateBox = 'grid min-h-52 place-items-center rounded-xl border p-5'
</script>

<template>
  <div v-if="!hasPropsCoords && store.isDetecting" :class="stateBox">
    <LoadingState message="جاري تحديد موقعك..." />
  </div>

  <button
    v-else-if="!hasPropsCoords && (store.latitude === 0 || store.longitude === 0)"
    type="button"
    :class="stateBox"
    class="w-full cursor-pointer text-center transition-colors hover:bg-accent focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none"
    @click="detect"
  >
    اضغط هنا لتحديد الموقع الخاص بك وعرض مواقيت الصلاة
  </button>

  <div v-else-if="isFetching || isRecoveringOnReconnect" :class="stateBox">
    <LoadingState message="جاري تحميل مواقيت الصلاة..." />
  </div>

  <div v-else-if="error" :class="stateBox">
    <OfflineState v-if="!online" />
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." v-else />
  </div>

  <div v-else-if="timings" class="flex flex-col gap-2">
    <div class="prayer-header flex items-center justify-between rounded-xl p-3 text-primary-foreground">
      <div>
        <!-- Secondary text on the primary-colored header; the primary foreground
             token at reduced alpha keeps contrast readable where a gray would
             wash out. -->
        <div class="flex items-center gap-2 text-sm text-primary-foreground/85">
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full border border-primary-foreground/35 text-primary-foreground [&_svg]:size-4"
          >
            <PrayerIcon v-if="nextPrayerKey" :name="timingsMap[nextPrayerKey]?.icon" />
          </span>
          <span v-if="nextPrayerKey">الصلاة القادمة · {{ timingsMap[nextPrayerKey]?.label }}</span>
        </div>
        <div class="mt-1 text-2xl font-bold">{{ remainingTime }}</div>
      </div>
      <div class="text-end">
        <div class="mb-1 font-semibold">{{ hijriDay }}</div>
        <span class="text-sm text-primary-foreground/85">{{ hijriDate }}</span>
      </div>
    </div>

    <!-- Vertical / list layout -->
    <div v-if="vertical" class="flex flex-col gap-1">
      <div
        v-for="(timing, key) in timingsMap"
        :key="key"
        class="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
        :class="{ 'border-primary font-bold': key === nextPrayerKey }"
      >
        <div class="flex items-center gap-2">
          <span
            class="grid size-6 shrink-0 place-items-center [&_svg]:size-[1.15rem]"
            :class="key === nextPrayerKey ? 'text-primary' : 'text-muted-foreground'"
          >
            <PrayerIcon :name="timing.icon" />
          </span>
          <span class="font-semibold">{{ timing.label }}</span>
        </div>
        <span class="font-semibold">{{ formatTiming(timings.data.timings[key]) }}</span>
      </div>
    </div>

    <!-- Cards layout -->
    <div v-else class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
      <Card
        v-for="(timing, key) in timingsMap"
        :key="key"
        class="h-full gap-0 py-0 transition-colors"
        :class="{ 'border-primary': key === nextPrayerKey }"
      >
        <CardContent class="flex flex-col items-center justify-center gap-2 p-3 text-center">
          <span
            class="grid size-9 shrink-0 place-items-center rounded-full border [&_svg]:size-[1.15rem]"
            :class="key === nextPrayerKey ? 'border-primary text-primary' : 'text-muted-foreground'"
          >
            <PrayerIcon :name="timing.icon" />
          </span>
          <div>
            <div class="mb-1 text-sm font-semibold" :class="{ 'text-muted-foreground': key !== nextPrayerKey }">
              {{ timing.label }}
            </div>
            <div class="text-xl leading-none font-bold">{{ formatTiming(timings.data.timings[key]) }}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* The next-prayer banner darkens the runtime `--primary` token into a gradient;
   no single color utility can express the color-mix, so it stays in CSS. */
.prayer-header {
  background-image: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, #000) 100%);
}
</style>
