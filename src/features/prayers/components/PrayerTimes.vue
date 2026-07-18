<script setup>
import { computed } from 'vue'
import { usePrayersStore } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/composables/usePrayerLocation'
import { useFetch, useDateFormat, useOnline, useNow } from '@vueuse/core'
import { useReconnectExecute } from '@/shared/composables/useReconnectExecute'

import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'
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
</script>

<template>
  <div v-if="!hasPropsCoords && store.isDetecting" class="prayer-state border rounded p-5">
    <LoadingState message="جاري تحديد موقعك..." />
  </div>

  <button
    v-else-if="!hasPropsCoords && (store.latitude === 0 || store.longitude === 0)"
    type="button"
    class="prayer-state detect-btn w-100 border rounded p-5 text-center"
    @click="detect"
  >
    اضغط هنا لتحديد الموقع الخاص بك وعرض مواقيت الصلاة
  </button>

  <div v-else-if="isFetching || isRecoveringOnReconnect" class="prayer-state border rounded p-5">
    <LoadingState message="جاري تحميل مواقيت الصلاة..." />
  </div>

  <div v-else-if="error" class="prayer-state border rounded p-5">
    <OfflineState v-if="!online" />
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." v-else />
  </div>

  <div v-else-if="timings" class="d-flex flex-column gap-2">
    <div class="prayer-header d-flex align-items-center justify-content-between p-3 rounded text-white">
      <div>
        <div class="d-flex align-items-center gap-2 small text-soft">
          <span class="icon-circle icon-circle--header">
            <PrayerIcon v-if="nextPrayerKey" :name="timingsMap[nextPrayerKey]?.icon" />
          </span>
          <span v-if="nextPrayerKey">الصلاة القادمة · {{ timingsMap[nextPrayerKey]?.label }}</span>
        </div>
        <div class="fs-4 fw-bold mt-1">{{ remainingTime }}</div>
      </div>
      <div class="text-end">
        <div class="mb-1 fw-semibold">{{ hijriDay }}</div>
        <small class="text-soft">{{ hijriDate }}</small>
      </div>
    </div>

    <!-- Vertical / list layout -->
    <div v-if="vertical" class="d-flex flex-column gap-1">
      <div
        v-for="(timing, key) in timingsMap"
        :key="key"
        class="d-flex align-items-center justify-content-between px-3 py-2 rounded-2 small"
        :class="
          key === nextPrayerKey
            ? 'text-primary bg-primary-subtle border border-primary-subtle fw-bold'
            : 'bg-body-tertiary'
        "
      >
        <div class="d-flex align-items-center gap-2">
          <span class="icon-container">
            <PrayerIcon :name="timing.icon" />
          </span>
          <span class="fw-semibold">{{ timing.label }}</span>
        </div>
        <span class="fw-semibold">{{ formatTiming(timings.data.timings[key]) }}</span>
      </div>
    </div>

    <!-- Cards layout -->
    <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-2">
      <div v-for="(timing, key) in timingsMap" :key="key" class="col">
        <div
          class="card h-100 prayer-card"
          :class="key === nextPrayerKey ? 'border-primary bg-primary-subtle text-primary' : ''"
        >
          <div class="card-body d-flex flex-column align-items-center justify-content-center text-center gap-2 p-3">
            <span
              class="icon-circle"
              :class="key === nextPrayerKey ? 'border-primary text-primary' : 'text-secondary'"
            >
              <PrayerIcon :name="timing.icon" />
            </span>
            <div>
              <div class="small fw-semibold mb-1" :class="{ 'text-body-secondary': key !== nextPrayerKey }">
                {{ timing.label }}
              </div>
              <div class="fs-5 fw-bold lh-1">{{ formatTiming(timings.data.timings[key]) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.prayer-header {
  background: linear-gradient(135deg, var(--bs-primary) 0%, color-mix(in srgb, var(--bs-primary) 85%, #000) 100%);
}

/* Secondary text on the primary-colored header; plain white at reduced alpha
   keeps contrast readable where a gray would wash out. */
.prayer-header .text-soft {
  color: rgba(255, 255, 255, 0.85);
}

.prayer-card {
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

/* Reserve room for loading / detect / error states so the swap to loaded
   content doesn't shift the page. */
.prayer-state {
  display: grid;
  place-items: center;
  min-height: 13rem;
}

.detect-btn {
  background: transparent;
  color: var(--bs-body-color);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(var(--bs-secondary-rgb), 0.1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
  }
}

.icon-container {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;

  :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
  }
}

.icon-circle--header {
  width: 1.75rem;
  height: 1.75rem;
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;

  :deep(svg) {
    width: 1rem;
    height: 1rem;
  }
}
</style>
