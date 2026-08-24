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
import { getNextPrayerKey, getPrayerPhase, PRAYER_SEQUENCE } from '@/features/prayers/lib/prayerPhase'
import { IconMapPin } from '@tabler/icons-vue'

import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'

const props = defineProps({
  lat: { type: [Number, String], default: null },
  long: { type: [Number, String], default: null },
  vertical: { type: Boolean, default: false },
})

const hasPropsCoords = computed(() => props.lat != null && props.long != null)

// Reactive state for current time. The countdown only displays seconds, so a
// 1s tick is enough — the default rAF interval would recompute phases ~60fps.
const now = useNow({ interval: 1000 })

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

// Fraction of the window between the previous prayer and the next one that
// has already elapsed — drives the hero progress bar.
const progress = computed(() => {
  const prayerTimes = timings.value?.data?.timings
  const next = nextPrayerKey.value
  if (!prayerTimes || !next) return 0

  const nowMs = now.value.getTime()
  const DAY = 24 * 60 * 60 * 1000
  const idx = PRAYER_SEQUENCE.indexOf(next)
  const prevKey = PRAYER_SEQUENCE[(idx - 1 + PRAYER_SEQUENCE.length) % PRAYER_SEQUENCE.length]

  let nextMs = new Date(prayerTimes[next]).getTime()
  let prevMs = new Date(prayerTimes[prevKey]).getTime()

  if (nextMs < nowMs) nextMs += DAY
  if (prevMs > nowMs) prevMs -= DAY

  const span = nextMs - prevMs
  if (span <= 0) return 0
  return Math.min(1, Math.max(0, (nowMs - prevMs) / span))
})

const nextPrayerTime = computed(() => {
  const time = timings.value?.data?.timings?.[nextPrayerKey.value]
  return time ? formatTiming(time) : ''
})
</script>

<template>
  <div v-if="!hasPropsCoords && store.isDetecting" class="prayer-state border rounded p-5">
    <LoadingState message="جاري تحديد موقعك..." />
  </div>

  <div
    v-else-if="!hasPropsCoords && (store.latitude === 0 || store.longitude === 0)"
    class="prayer-state prayer-detect p-4 p-md-5 text-center"
  >
    <span class="icon-circle icon-circle--lg text-primary mb-3">
      <IconMapPin />
    </span>
    <h3 class="fs-5 fw-bold mb-1">أين أنت الآن؟</h3>
    <p class="text-body-secondary mb-3 prayer-detect__hint">
      نحتاج موقعك لحساب مواقيت الصلاة بدقة. لا نخزّن موقعك على أي خادم.
    </p>
    <button type="button" class="btn btn-primary rounded-pill px-4" @click="detect">تحديد موقعي</button>
  </div>

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
        <span class="prayer-hero__badge">الصلاة القادمة</span>
      </div>

      <div v-if="nextPrayerKey" class="prayer-hero__next">
        <span class="icon-circle icon-circle--lg prayer-hero__icon">
          <PrayerIcon :name="timingsMap[nextPrayerKey]?.icon" />
        </span>
        <div class="min-w-0">
          <h3 class="prayer-hero__name font-display">{{ timingsMap[nextPrayerKey]?.label }}</h3>
          <p class="prayer-hero__remain">
            <span class="prayer-hero__time">{{ nextPrayerTime }}</span>
            <span class="prayer-hero__dot" aria-hidden="true">·</span>
            <span>باقي {{ remainingTime }}</span>
          </p>
        </div>
      </div>

      <div
        class="prayer-hero__progress"
        role="progressbar"
        aria-label="الوقت المنقضي حتى الصلاة القادمة"
        :aria-valuenow="Math.round(progress * 100)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="prayer-hero__bar" :style="{ '--progress': progress }"></span>
      </div>
    </div>

    <!-- Vertical / list layout -->
    <div v-if="vertical" class="d-flex flex-column gap-1">
      <div
        v-for="(timing, key) in timingsMap"
        :key="key"
        class="prayer-row d-flex align-items-center justify-content-between px-3 py-2 small"
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
            <span class="icon-circle" :class="phases[key] === 'next' ? 'text-primary' : 'text-secondary'">
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
  position: relative;
  overflow: hidden;
  padding: 1.35rem 1.35rem 1.25rem;
  border-radius: var(--bs-border-radius-xl);
  background:
    radial-gradient(28rem 14rem at 100% 0, rgba(255, 255, 255, 0.18), transparent 70%),
    linear-gradient(135deg, var(--bs-primary), color-mix(in srgb, var(--bs-primary) 72%, #000));

  /* Geometric lattice — a faint 8-point-star tile, the classic Islamic motif. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.08;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23fff' stroke-width='1'%3E%3Cpath d='M28 4l6.5 17.5L52 28l-17.5 6.5L28 52l-6.5-17.5L4 28l17.5-6.5z'/%3E%3Cpath d='M28 12l4 12 12 4-12 4-4 12-4-12-12-4 12-4z'/%3E%3Ccircle cx='28' cy='28' r='3'/%3E%3Ccircle cx='0' cy='0' r='3'/%3E%3Ccircle cx='56' cy='0' r='3'/%3E%3Ccircle cx='0' cy='56' r='3'/%3E%3Ccircle cx='56' cy='56' r='3'/%3E%3C/g%3E%3C/svg%3E");
    background-size: 56px 56px;
    mask-image: linear-gradient(200deg, #000 20%, transparent 85%);
    -webkit-mask-image: linear-gradient(200deg, #000 20%, transparent 85%);
    pointer-events: none;
  }

  > * {
    position: relative;
  }
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

.prayer-hero__badge {
  padding: 0.2rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.prayer-hero__dot {
  opacity: 0.6;
}

.prayer-hero__next {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
}

.prayer-hero__icon {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.14);
}

.prayer-hero__name,
.prayer-hero__remain {
  margin: 0;
}

.prayer-hero__name {
  font-size: clamp(2rem, 4.5vw, 2.75rem);
  font-weight: 500;
  line-height: 1.15;
}

.prayer-hero__remain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.3rem;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.prayer-hero__time {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.prayer-hero__progress {
  margin-top: 1.25rem;
  height: 0.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.prayer-hero__bar {
  display: block;
  height: 100%;
  width: calc(var(--progress, 0) * 100%);
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.7), #fff);
  transition: width 1s linear;
}

.prayer-row {
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius);
  background-color: var(--app-surface);
  box-shadow: var(--app-shadow-card);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.prayer-row--past {
  color: var(--bs-secondary-color);
  box-shadow: none;
}

.prayer-row--next {
  border-color: var(--app-hairline-strong);
  background-color: var(--app-surface-active);
  box-shadow: none;
}

.prayer-card {
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.prayer-card--past {
  color: var(--bs-secondary-color);
  box-shadow: none;
}

.prayer-card--next {
  border-color: var(--app-hairline-strong);
  background-color: var(--app-surface-active);
  box-shadow: none;
}

/* Reserve room for loading / detect / error states so the swap to loaded
   content doesn't shift the page. */
.prayer-state {
  display: grid;
  place-items: center;
  /* Keep the pre-location state compact on phones so real content fits the
     first screen; the taller reserve only matters on desktop. */
  min-height: 10rem;

  @media (min-width: 768px) {
    min-height: 13rem;
  }
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-xl);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
}

.prayer-detect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  border-color: var(--app-hairline-strong);
  background: radial-gradient(24rem 12rem at 50% 0, var(--app-tint), transparent 70%), var(--app-surface);
}

.prayer-detect__hint {
  max-width: 28rem;
  font-size: 0.925rem;
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
</style>
