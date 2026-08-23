<script setup>
import { computed } from 'vue'
import { usePrayersStore } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/composables/usePrayerLocation'
import { useFetch, useDateFormat, useOnline, useNow } from '@vueuse/core'
import { useReconnectExecute } from '@/shared/composables/useReconnectExecute'
import { IconMapPin } from '@tabler/icons-vue'

import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'
import { cn } from '@/shared/lib/utils'
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

const PRAYER_ORDER = Object.keys(timingsMap)
const DAY_MS = 24 * 60 * 60 * 1000

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

const nextPrayerWindow = computed(() => {
  const prayerTimes = timings.value?.data?.timings
  if (!prayerTimes || !nextPrayerKey.value) return null

  const stamps = PRAYER_ORDER.map((name) => new Date(prayerTimes[name]).getTime())
  const index = PRAYER_ORDER.indexOf(nextPrayerKey.value)
  if (index < 0 || stamps.some(Number.isNaN)) return null

  let end = stamps[index]
  let start = index === 0 ? stamps[stamps.length - 1] - DAY_MS : stamps[index - 1]

  if (end <= now.value.getTime()) {
    end += DAY_MS
    start += DAY_MS
  }

  return end > start ? { start, end } : null
})

const elapsedPercent = computed(() => {
  const window = nextPrayerWindow.value
  if (!window) return 0

  const ratio = (now.value.getTime() - window.start) / (window.end - window.start)
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
})

const isPast = (key) => {
  const time = timings.value?.data?.timings?.[key]
  if (!time) return false
  return new Date(time).getTime() < now.value.getTime()
}

const prayerTone = (key) => {
  if (key === nextPrayerKey.value) return 'bg-primary/10 text-primary'
  return isPast(key) ? 'text-muted-foreground' : ''
}

// Reserve room for loading / detect / error states so the swap to loaded
// content doesn't shift the page.
const stateBox = 'grid min-h-52 place-items-center rounded-3xl bg-card p-4 shadow-sm'
</script>
<template>
  <div v-if="!hasPropsCoords && store.isDetecting" :class="stateBox">
    <LoadingState message="جاري تحديد موقعك..." />
  </div>
  <button
    v-else-if="!hasPropsCoords && (store.latitude === 0 || store.longitude === 0)"
    type="button"
    :class="stateBox"
    class="w-full cursor-pointer transition duration-200 hover:bg-accent/40 focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none active:scale-95"
    @click="detect"
  >
    <span class="flex flex-col items-center gap-4 px-4 text-center">
      <span class="grid size-14 place-items-center rounded-full bg-primary/12 text-primary">
        <IconMapPin class="size-6" />
      </span>
      <span class="max-w-xs text-base leading-relaxed text-muted-foreground">
        اضغط هنا لتحديد الموقع الخاص بك وعرض مواقيت الصلاة
      </span>
    </span>
  </button>
  <div v-else-if="isFetching || isRecoveringOnReconnect" :class="stateBox">
    <LoadingState message="جاري تحميل مواقيت الصلاة..." />
  </div>
  <div v-else-if="error" :class="stateBox">
    <OfflineState v-if="!online" />
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." v-else />
  </div>
  <div v-else-if="timings" class="flex flex-col gap-4">
    <div class="surface-hero rounded-3xl p-5 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary [&_svg]:size-5">
            <PrayerIcon v-if="nextPrayerKey" :name="timingsMap[nextPrayerKey]?.icon" />
          </span>
          <span v-if="nextPrayerKey" class="truncate text-sm text-muted-foreground">الصلاة القادمة</span>
        </div>
        <div class="min-w-0 text-end">
          <div class="text-sm font-medium">{{ hijriDay }}</div>
          <div class="text-xs text-pretty text-muted-foreground">{{ hijriDate }}</div>
        </div>
      </div>
      <div class="mt-5">
        <div class="font-display text-4xl leading-none tabular-nums sm:text-5xl">{{ remainingTime }}</div>
        <div v-if="nextPrayerKey" class="mt-3 flex items-center gap-2 text-base">
          <span class="font-medium text-primary">{{ timingsMap[nextPrayerKey]?.label }}</span>
          <span class="size-1 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden="true"></span>
          <span class="text-muted-foreground tabular-nums">
            {{ formatTiming(timings.data.timings[nextPrayerKey]) }}
          </span>
        </div>
      </div>
      <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-primary/15" aria-hidden="true">
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
          :style="{ width: `${elapsedPercent}%` }"
        ></div>
      </div>
    </div>
    <div v-if="vertical" class="divide-y overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm">
      <div
        v-for="(timing, key) in timingsMap"
        :key="key"
        class="relative flex min-h-14 items-center gap-3 px-4 py-3"
        :class="prayerTone(key)"
      >
        <span
          v-if="key === nextPrayerKey"
          class="absolute inset-y-2 start-0 w-1 rounded-e-full bg-primary"
          aria-hidden="true"
        ></span>
        <span
          class="grid size-9 shrink-0 place-items-center rounded-full [&_svg]:size-5"
          :class="key === nextPrayerKey ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'"
        >
          <PrayerIcon :name="timing.icon" />
        </span>
        <span class="min-w-0 flex-1 truncate text-base font-medium">{{ timing.label }}</span>
        <span class="shrink-0 text-base font-medium tabular-nums">
          {{ formatTiming(timings.data.timings[key]) }}
        </span>
      </div>
    </div>
    <div
      v-else
      class="-mx-4 -my-2 flex snap-x gap-3 overflow-x-auto px-4 py-2 no-scrollbar sm:mx-0 sm:my-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:py-0 lg:grid-cols-6"
    >
      <div
        v-for="(timing, key) in timingsMap"
        :key="key"
        :class="
          cn(
            'flex w-28 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl bg-card px-3 py-4 text-center text-card-foreground shadow-sm sm:w-auto',
            prayerTone(key),
          )
        "
      >
        <span
          class="grid size-10 place-items-center [&_svg]:size-6"
          :class="key === nextPrayerKey ? '' : 'text-muted-foreground'"
        >
          <PrayerIcon :name="timing.icon" />
        </span>
        <span class="text-sm font-medium">{{ timing.label }}</span>
        <span class="text-base leading-none font-medium tabular-nums">
          {{ formatTiming(timings.data.timings[key]) }}
        </span>
      </div>
    </div>
  </div>
</template>
