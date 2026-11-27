<script setup>
import { computed } from 'vue'
import { usePrayersStore } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/composables/usePrayerLocation'
import { formatDate, useNow } from '@vueuse/core'

import LoadingState from '@/shared/ui/LoadingState.vue'
import { formatTime, toArabicNumerals } from '@/shared/utils/arabic'
import { calculatePrayerTimes } from '@/features/prayers/lib/prayerTimes'
import { getHijriDate } from '@/features/prayers/lib/hijri'
import { getNextPrayerKey, getPrayerPhase, PRAYER_SEQUENCE } from '@/features/prayers/lib/prayerPhase'
import { IconMapPin } from '@tabler/icons-vue'

import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon.vue'

const props = defineProps({
  lat: { type: [Number, String], default: null },
  long: { type: [Number, String], default: null },
  vertical: { type: Boolean, default: false },
  // Folds the six times into the next-prayer card instead of listing them below it.
  compact: { type: Boolean, default: false },
  // Home shows the weekday in its greeting, so the card can leave it out.
  showWeekday: { type: Boolean, default: true },
})

const hasPropsCoords = computed(() => props.lat != null && props.long != null)

// Match the countdown's one-second precision instead of updating every frame.
const now = useNow({ interval: 1000 })

// A local-date string only changes at midnight, so the times below are recomputed once a day.
const today = computed(() => formatDate(now.value, 'YYYY-MM-DD'))
const todayDate = computed(() => new Date(`${today.value}T00:00:00`))

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

// Corrupt or cleared saved coordinates (NaN, 0) must lead back to the location prompt, not a blank section.
const isCoordinate = (value) => Number.isFinite(Number(value)) && Number(value) !== 0
const hasCoords = computed(() => isCoordinate(latitude.value) && isCoordinate(longitude.value))

const timingsFor = (date) =>
  calculatePrayerTimes({
    latitude: latitude.value,
    longitude: longitude.value,
    date,
    method: store.calcMethod,
    school: store.calcSchool,
    latitudeAdjustment: store.calcLatitudeAdjustment,
    shafaq: store.calcShafaq,
  })

const timings = computed(() => (hasCoords.value ? timingsFor(todayDate.value) : null))

// The compact strip drops the ص/م suffix too; which half of the day each prayer falls in is obvious. No time keeps a
// leading zero, so the strip, the list and the cards read the same.
const formatShortTiming = (time) => toArabicNumerals(formatDate(new Date(time), 'h:mm'))

const formatTiming = (time) => {
  return toArabicNumerals(formatDate(new Date(time), 'h:mm A').replace('AM', 'ص').replace('PM', 'م'))
}

const hijri = computed(() => getHijriDate(todayDate.value))
const hijriDate = computed(() => toArabicNumerals(`${hijri.value.day} ${hijri.value.month} ${hijri.value.year}`))
const hijriDay = computed(() => hijri.value.weekday)

const nextPrayerKey = computed(() => getNextPrayerKey(now.value.getTime(), timings.value))

const phases = computed(() => {
  const result = {}
  const next = nextPrayerKey.value
  const prayerTimes = timings.value
  const nowMs = now.value.getTime()

  for (const key of Object.keys(timingsMap)) {
    result[key] = getPrayerPhase(key, next, nowMs, prayerTimes)
  }

  return result
})

// When the next prayer is already past today (Fajr, after Isha), it's tomorrow's, worked out for tomorrow's date;
// the label and the countdown both use it.
const nextPrayerAt = computed(() => {
  const key = nextPrayerKey.value
  if (!timings.value || !key) return null
  const today = new Date(timings.value[key])
  if (today >= now.value) return today
  const tomorrow = new Date(todayDate.value)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return new Date(timingsFor(tomorrow)[key])
})

const remainingTime = computed(() => (nextPrayerAt.value ? formatTime((nextPrayerAt.value - now.value) / 1000) : null))

const progress = computed(() => {
  const prayerTimes = timings.value
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

const nextPrayerTime = computed(() => (nextPrayerAt.value ? formatTiming(nextPrayerAt.value) : ''))
</script>

<template>
  <div v-if="!hasPropsCoords && store.isDetecting" class="prayer-state border rounded p-5">
    <LoadingState message="جاري تحديد موقعك..." />
  </div>

  <div v-else-if="!hasPropsCoords && !hasCoords" class="prayer-state prayer-detect p-4 p-md-5 text-center">
    <span class="icon-circle icon-circle--lg text-primary mb-3">
      <IconMapPin />
    </span>
    <h3 class="fs-5 fw-bold mb-1">أين أنت الآن؟</h3>
    <p class="text-body-secondary mb-3 prayer-detect__hint">
      نحتاج موقعك لحساب مواقيت الصلاة بدقة. لا نخزّن موقعك على أي خادم.
    </p>
    <button type="button" class="btn btn-primary rounded-pill px-4" @click="detect">تحديد موقعي</button>
  </div>

  <div v-else-if="timings" class="d-flex flex-column gap-2">
    <div class="prayer-hero">
      <div class="prayer-hero__meta">
        <div class="prayer-hero__date">
          <span class="dot-list">
            <span v-if="showWeekday && hijriDay">{{ hijriDay }}</span>
            <span>{{ hijriDate }}</span>
          </span>
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
            <span class="dot-list">
              <span class="prayer-hero__time">{{ nextPrayerTime }}</span>
              <span>باقي {{ remainingTime }}</span>
            </span>
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

      <ol v-if="compact" class="prayer-strip" aria-label="مواقيت اليوم">
        <li
          v-for="(timing, key) in timingsMap"
          :key="key"
          class="prayer-strip__item"
          :class="`prayer-strip__item--${phases[key]}`"
          :aria-current="phases[key] === 'next' ? 'true' : undefined"
        >
          <PrayerIcon :name="timing.icon" class="prayer-strip__icon" />
          <span class="prayer-strip__label">{{ timing.label }}</span>
          <span class="prayer-strip__time">{{ formatShortTiming(timings[key]) }}</span>
        </li>
      </ol>
    </div>

    <!-- One inset grouped list, like the rest of the app's lists. -->
    <ol v-if="!compact && vertical" class="list-group prayer-list" aria-label="مواقيت اليوم">
      <li
        v-for="(timing, key) in timingsMap"
        :key="key"
        class="list-group-item prayer-row"
        :class="`prayer-row--${phases[key]}`"
        :aria-current="phases[key] === 'next' ? 'true' : undefined"
      >
        <span class="icon-container" :class="phases[key] === 'next' ? 'text-primary' : 'text-secondary'">
          <PrayerIcon :name="timing.icon" />
        </span>
        <span class="prayer-row__label">{{ timing.label }}</span>
        <span class="prayer-row__time">{{ formatTiming(timings[key]) }}</span>
      </li>
    </ol>

    <div v-else-if="!compact" class="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-2">
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
              <div class="fs-5 fw-bold lh-1">{{ formatTiming(timings[key]) }}</div>
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
  border-radius: var(--bs-border-radius-lg);
  box-shadow: var(--app-shadow-card);
  /* Text and icons take --app-on-primary: white on a dark brand colour, near-black on a light one (sand). */
  color: var(--app-on-primary);
  background:
    radial-gradient(28rem 14rem at 100% 0, rgba(255, 255, 255, 0.18), transparent 70%),
    linear-gradient(135deg, var(--bs-primary), color-mix(in srgb, var(--bs-primary) 72%, #000));

  /* The gradient deepens away from the text colour: towards black under white text, towards white under dark text, so a
     light brand colour doesn't darken behind its dark text. */
  @supports (color: rgb(from red r g b)) {
    background:
      radial-gradient(28rem 14rem at 100% 0, rgba(255, 255, 255, 0.18), transparent 70%),
      linear-gradient(
        135deg,
        var(--bs-primary),
        color-mix(
          in srgb,
          var(--bs-primary) 72%,
          rgb(from var(--app-on-primary) calc(255 - r) calc(255 - g) calc(255 - b))
        )
      );
  }

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
  color: color-mix(in srgb, var(--app-on-primary) 85%, var(--bs-primary));
}

.prayer-hero__badge {
  padding: 0.2rem 0.7rem;
  border: 1px solid color-mix(in srgb, var(--app-on-primary) 35%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-on-primary) 12%, transparent);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Items separated by a dot that never dangles: when the line wraps, the dot leading the new line sits in the pulled-in
   start margin, which the wrapper clips. Clip, not hidden, so the wrapper still won't shrink narrower than its words. */
.prayer-hero__date,
.prayer-hero__remain {
  overflow: clip;
}

.dot-list {
  --dot-space: 0.4rem;
  --dot-width: calc(0.5em + 2 * var(--dot-space));

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-inline-start: calc(-1 * var(--dot-width));

  > * {
    display: flex;
    align-items: center;
  }

  > *::before {
    content: '·';
    flex-shrink: 0;
    width: var(--dot-width);
    opacity: 0.6;
    text-align: center;
  }
}

.prayer-hero__next {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
}

.prayer-hero__icon {
  color: var(--app-on-primary);
  border-color: color-mix(in srgb, var(--app-on-primary) 30%, transparent);
  background: color-mix(in srgb, var(--app-on-primary) 14%, transparent);
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
  margin-top: 0.3rem;
  font-size: 1rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--app-on-primary) 90%, var(--bs-primary));
}

/* The time and the countdown each stay on one line; between them is where the line breaks. */
.prayer-hero__remain .dot-list > * {
  white-space: nowrap;
}

.prayer-hero__time {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.prayer-hero__progress {
  margin-top: 1.25rem;
  height: 0.35rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-on-primary) 20%, transparent);
  overflow: hidden;
}

.prayer-hero__bar {
  display: block;
  height: 100%;
  width: calc(var(--progress, 0) * 100%);
  border-radius: inherit;
  background: linear-gradient(90deg, color-mix(in srgb, var(--app-on-primary) 70%, transparent), var(--app-on-primary));
  transition: width 1s linear;
}

.prayer-strip {
  /* The names and times scale with the strip's width, so a narrow phone at a large text size still fits all six. */
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.125rem;
  /* The divider spans the card edge to edge; the padding keeps the items where they were. */
  margin: 1.125rem -1.35rem -0.375rem;
  padding: 0.875rem 0.5rem 0;
  border-top: 1px solid color-mix(in srgb, var(--app-on-primary) 16%, transparent);
  list-style: none;
}

.prayer-strip__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.45rem 0.125rem;
  border-radius: var(--bs-border-radius);
  color: color-mix(in srgb, var(--app-on-primary) 85%, var(--bs-primary));
  text-align: center;
}

.prayer-strip__item--past {
  color: color-mix(in srgb, var(--app-on-primary) 50%, var(--bs-primary));
}

.prayer-strip__item--next {
  background: color-mix(in srgb, var(--app-on-primary) 16%, transparent);
  color: var(--app-on-primary);
}

.prayer-strip__icon {
  width: 1.1rem;
  height: 1.1rem;
}

/* The longest name (المغرب) is about three of its own font sizes wide; a sixth of the strip, less the gaps and
   padding, sets the most each column can give it. */
.prayer-strip__label {
  max-width: 100%;
  overflow: hidden;
  font-size: min(0.75rem, calc(5.5cqi - 0.125rem));
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prayer-strip__time {
  font-size: min(0.875rem, calc(6cqi - 0.125rem));
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  white-space: nowrap;
}

.prayer-list {
  margin: 0;
  padding: 0;
}

.prayer-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3rem;
  transition: background-color 0.2s ease;
}

.prayer-row__label {
  flex: 1;
  min-width: 0;
  font-weight: 600;
}

.prayer-row__time {
  flex-shrink: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.prayer-row--past {
  color: var(--bs-secondary-color);
}

.prayer-row--next {
  background-color: var(--app-surface-active);
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

/* Prevent layout shift while state content changes. */
.prayer-state {
  display: grid;
  place-items: center;
  min-height: 10rem;

  @media (min-width: 768px) {
    min-height: 13rem;
  }
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-lg);
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
