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
import { getNextPrayerKey, getPrayerPhase } from '@/features/prayers/lib/prayerPhase'

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

const nextPrayerKey = computed(() => getNextPrayerKey(now.value.getTime(), timings.value?.data?.timings))

const phases = computed(() => {
  const result = {}
  const next = nextPrayerKey.value
  const prayerTimes = timings.value?.data?.timings
  const nowMs = now.value.getTime()

  for (const key of Object.keys(timingsMap)) {
    result[key] = getPrayerPhase(key, next, nowMs, prayerTimes)
  }

  return result
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
    <div class="prayer-hero text-white">
      <div class="prayer-hero__meta">
        <div class="prayer-hero__date">
          <span v-if="hijriDay">{{ hijriDay }}</span>
          <span v-if="hijriDay && hijriDate" class="prayer-hero__dot" aria-hidden="true">·</span>
          <span>{{ hijriDate }}</span>
        </div>
        <span class="icon-circle icon-circle--header">
          <PrayerIcon v-if="nextPrayerKey" :name="timingsMap[nextPrayerKey]?.icon" />
        </span>
      </div>

      <div v-if="nextPrayerKey" class="prayer-hero__next">
        <h3 class="prayer-hero__name font-display">{{ timingsMap[nextPrayerKey]?.label }}</h3>
        <p class="prayer-hero__remain">باقي {{ remainingTime }}</p>
      </div>
    </div>

    <!-- Vertical / list layout -->
    <div v-if="vertical" class="d-flex flex-column gap-1">
      <div
        v-for="(timing, key) in timingsMap"
        :key="key"
        class="prayer-row d-flex align-items-center justify-content-between px-3 py-2 rounded-2 small border"
        :class="`prayer-row--${phases[key]}`"
        :aria-current="phases[key] === 'next' ? 'true' : undefined"
      >
        <div class="d-flex align-items-center gap-2">
          <span class="icon-container" :class="phases[key] === 'next' ? 'text-primary' : 'text-secondary'">
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
          :class="`prayer-card--${phases[key]}`"
          :aria-current="phases[key] === 'next' ? 'true' : undefined"
        >
          <div class="card-body d-flex flex-column align-items-center justify-content-center text-center gap-2 p-3">
            <span class="icon-circle" :class="phases[key] === 'next' ? 'border-primary text-primary' : 'text-secondary'">
              <PrayerIcon :name="timing.icon" />
            </span>
            <div>
              <div class="small fw-semibold mb-1" :class="{ 'text-body-secondary': phases[key] !== 'next' }">
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
.prayer-hero {
  padding: 1.35rem 1.25rem 1.25rem;
  background-color: var(--bs-primary);
  border-radius: var(--bs-border-radius-lg);
}

.prayer-hero__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.prayer-hero__date {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
}

.prayer-hero__dot {
  opacity: 0.7;
}

.prayer-hero__next {
  margin-top: 1rem;
}

.prayer-hero__name,
.prayer-hero__remain {
  margin: 0;
}

.prayer-hero__name {
  font-size: clamp(2rem, 4.5vw, 2.75rem);
  font-weight: 500;
  line-height: 1.2;
}

.prayer-hero__remain {
  margin-top: 0.25rem;
  font-size: 1.05rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.prayer-row {
  background-color: var(--bs-body-bg);
}

.prayer-row--past {
  color: var(--bs-secondary-color);
}

.prayer-row--next {
  border-color: var(--bs-primary) !important;
  background-color: color-mix(in srgb, var(--bs-primary) 10%, var(--bs-body-bg));
}

.prayer-card {
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.prayer-card--past {
  color: var(--bs-secondary-color);
}

.prayer-card--next {
  border-color: var(--bs-primary);
  background-color: color-mix(in srgb, var(--bs-primary) 10%, var(--bs-body-bg));
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
