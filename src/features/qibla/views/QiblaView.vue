<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { refDebounced, useNow, useScreenOrientation, useTimeoutFn } from '@vueuse/core'
import {
  IconCompass,
  IconCompassOff,
  IconDeviceMobile,
  IconDeviceMobileRotated,
  IconInfinity,
  IconMagnet,
  IconMapPinOff,
} from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import StatePanel from '@/shared/ui/StatePanel.vue'
import QiblaCompass from '@/features/qibla/components/QiblaCompass.vue'
import QiblaDebug from '@/features/qibla/components/QiblaDebug.vue'
import QiblaLocationNote from '@/features/qibla/components/QiblaLocationNote.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { getCurrentPosition } from '@/shared/utils/geolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { usePrayersStore } from '@/features/prayers/store'
import { isCoordinate } from '@/features/prayers/lib/coordinates'
import { useDeviceCompass } from '@/features/qibla/composables/useDeviceCompass'
import {
  getBearingUncertainty,
  getDeclination,
  getDistanceToKaaba,
  getQiblaDirection,
  normalizeAngle,
} from '@/features/qibla/lib/qibla'
import { getSunPosition } from '@/features/qibla/lib/sun'

const isMobile = useIsMobile()
const prayersStore = usePrayersStore()

// The location saved for prayer times is good enough for the qibla, so only ask when there isn't one.
const latitude = ref(isCoordinate(prayersStore.latitude) ? Number(prayersStore.latitude) : null)
const longitude = ref(isCoordinate(prayersStore.longitude) ? Number(prayersStore.longitude) : null)
const locationLoading = ref(latitude.value == null)
const locationError = ref(null)
// How far off a fresh fix may be, in metres. The saved location doesn't say.
const locationAccuracy = ref(null)

async function takeFreshFix() {
  const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
  latitude.value = position.coords.latitude
  longitude.value = position.coords.longitude
  locationAccuracy.value = position.coords.accuracy ?? null
}

async function requestLocation() {
  locationLoading.value = true
  locationError.value = null

  try {
    await takeFreshFix()
  } catch (err) {
    if (!navigator.geolocation) locationError.value = 'الموقع الجغرافي غير مدعوم في هذا المتصفح'
    else if (err?.code === 1) locationError.value = 'تم رفض إذن الوصول للموقع'
    else if (err?.code === 2) locationError.value = 'الموقع غير متاح حالياً'
    else locationError.value = 'فشل في تحديد الموقع'
  } finally {
    locationLoading.value = false
  }
}

// The saved location shows the qibla at once; a fresh fix then replaces it, in case you've travelled since.
// If the fix fails the screen says it's using the saved location, since an old city means a wrong bearing.
const usingSavedLocation = ref(latitude.value != null)
const refreshingLocation = ref(false)

async function refreshLocation() {
  refreshingLocation.value = true
  try {
    await takeFreshFix()
    usingSavedLocation.value = false
  } catch {
    // Keep the saved location, and keep saying so.
  } finally {
    refreshingLocation.value = false
  }
}

const hasLocation = computed(() => latitude.value != null && longitude.value != null)
// A bearing that isn't a finite number hides the compass rather than reading as north.
const qiblaDirection = computed(() => {
  if (!hasLocation.value) return null
  const bearing = getQiblaDirection(latitude.value, longitude.value)
  return Number.isFinite(bearing) ? bearing : null
})
const distance = computed(() => (hasLocation.value ? getDistanceToKaaba(latitude.value, longitude.value) : null))

// A rough location means a rough bearing, most of all near Makkah: 20 km out is under 1° in Cairo but 17° in Jeddah.
// Past this many degrees the screen shows the direction as approximate and won't say you're facing the qibla.
const MAX_UNCERTAINTY = 1
const uncertainty = computed(() => getBearingUncertainty(locationAccuracy.value, distance.value))
const impreciseLocation = computed(() => uncertainty.value != null && uncertainty.value > MAX_UNCERTAINTY)

const {
  heading,
  hasReading,
  hadReading,
  accuracy,
  sideways,
  upright,
  disturbed,
  drifted,
  raw,
  error: compassError,
  hasSupport,
  canRequestPermission,
  requestPermission,
} = useDeviceCompass()

const declination = computed(() => (hasLocation.value ? getDeclination(latitude.value, longitude.value) : 0))
const trueHeading = computed(() => normalizeAngle(heading.value + (declination.value ?? 0)))
// Without the correction the heading could be tens of degrees off, so there's no compass to show.
const compassIssue = computed(
  () => compassError.value || (declination.value == null ? 'تعذّر حساب الشمال الحقيقي لموقعك' : null),
)

// The heading assumes portrait; turned sideways (even with rotation lock, which still reports portrait) it's a quarter
// turn off.
const { angle: screenAngle } = useScreenOrientation()
const isPortrait = computed(() => !screenAngle.value && !sideways.value)

// iOS says how far off its compass may be; past this many degrees it needs calibrating.
const MAX_COMPASS_ERROR = 15
const needsCalibration = computed(
  () => accuracy.value != null && (accuracy.value < 0 || accuracy.value > MAX_COMPASS_ERROR),
)

const awaitingCompass = computed(() => isMobile.value && canRequestPermission.value && !hasReading.value)

// A phone that offers the compass but never sends a north-based reading (no magnetometer, or the browser withholds it)
// would otherwise sit on the resting tape forever, which looks like a working compass.
const readingTimedOut = ref(false)
useTimeoutFn(() => (readingTimedOut.value = true), 4000)

// On a phone the compass is the point of the screen, so when it can't be trusted the screen says so instead of showing
// a tape that reads like a live direction. A name, not an object, so a stream of readings doesn't count as a change.
const problem = computed(() => {
  if (!isMobile.value) return null
  // iOS with no usable heading never produces a reading, so this comes before the reading checks.
  if (accuracy.value != null && accuracy.value < 0) return 'calibrate'
  if (compassIssue.value && !canRequestPermission.value) return 'unavailable'
  // Stood up, an iPhone has no heading to give, so it may never have produced a reading either.
  if (upright.value) return 'upright'
  // Readings that stopped after arriving mean the sensor paused, not that the phone has no compass.
  if (!hasReading.value && hadReading.value) return 'paused'
  if (!hasReading.value) return hasSupport.value && readingTimedOut.value ? 'no-reading' : null
  if (!isPortrait.value) return 'sideways'
  if (disturbed.value) return 'disturbed'
  if (needsCalibration.value) return 'calibrate'
  return null
})
// Turning or tilting the phone can cross these lines for a moment; only a problem that lasts swaps the screen.
const lastingProblem = refDebounced(problem, 600)
// Until it swaps, the tape keeps following the phone but can't be relied on: it won't say you're facing the qibla.
const trusted = computed(() => problem.value === null)

// Isolated so the degree sign stays after the number inside Arabic text.
const bearingLine = computed(() =>
  qiblaDirection.value == null
    ? ''
    : ` القبلة على \u2066${toArabicNumerals(Math.round(qiblaDirection.value) % 360)}°\u2069 من الشمال.`,
)

// Panels that give the bearing in words also say where it's from, as the compass does: the distance, and the saved
// location with a way to refresh it.
const BEARING_PROBLEMS = new Set(['unavailable', 'no-reading', 'paused'])

const problemPanel = computed(() => {
  if (!problem.value) return null
  // With no live reading there's no tape to keep showing meanwhile, so the panel comes at once.
  if (hasReading.value && !lastingProblem.value) return null
  return {
    'calibrate': {
      icon: IconInfinity,
      title: 'البوصلة تحتاج إلى معايرة',
      message: 'حرّك هاتفك على شكل ∞ حتى تستقر القراءة.',
    },
    'disturbed': {
      icon: IconMagnet,
      title: 'البوصلة متأثرة بتشويش مغناطيسي',
      message: 'أبعد هاتفك عن المعادن والمغناطيس والأغطية الممغنطة، ثم حرّكه على شكل ∞ حتى تستقر القراءة.',
    },
    'upright': {
      icon: IconDeviceMobile,
      title: 'ضع الهاتف بشكل مسطح',
      message: 'اجعل الهاتف مسطحًا وشاشته إلى الأعلى لتعمل البوصلة بدقة.',
    },
    'unavailable': {
      icon: IconCompassOff,
      title: 'البوصلة غير متاحة',
      message: `${compassIssue.value}.${bearingLine.value}`,
    },
    'no-reading': {
      icon: IconCompassOff,
      title: 'تعذّرت قراءة البوصلة',
      message: `لا يبدو أن هاتفك يوفّر بوصلة لهذا التطبيق.${bearingLine.value}`,
    },
    'paused': {
      icon: IconCompass,
      title: 'توقفت قراءة البوصلة',
      message: `حرّك هاتفك قليلًا لتعود القراءة.${bearingLine.value}`,
    },
    'sideways': {
      icon: IconDeviceMobileRotated,
      title: 'أمسك الهاتف بشكل عمودي',
      message: 'أمسكه بالطول ومسطحًا لتعمل البوصلة.',
    },
  }[problem.value]
})

// Phones with a working compass follow the phone; anywhere else the screen shows the bearing and distance. A problem
// that hasn't lasted yet keeps the tape live rather than flashing the resting bearing as if it were a reading.
const live = computed(() => isMobile.value && hasReading.value && !problemPanel.value)

// On a phone the tape only ever shows a live heading. With none, and no panel saying why, it's still starting; the
// resting tape, with the Kaaba dead centre, would read as facing the qibla.
const startingCompass = computed(() => isMobile.value && !live.value)

// The sun's bearing needs only the clock and the location, so it checks the compass: aim the phone at the sun and it
// should sit on the centre line. Only while the sun is up, and not so high that its direction is hard to judge.
const now = useNow({ interval: 30000 })
const sunAzimuth = computed(() => {
  if (!hasLocation.value) return null
  const sun = getSunPosition(now.value, latitude.value, longitude.value)
  return sun.altitude > 3 && sun.altitude < 70 ? sun.azimuth : null
})

// /qibla?debug shows the raw sensor values, to check the compass on a real phone.
const route = useRoute()
const debugging = computed(() => 'debug' in route.query)
const debugValues = computed(() => {
  const event = raw.value?.event
  const fixed = (value, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : '–')
  return {
    'source': raw.value?.source ?? '–',
    'alpha / beta / gamma': `${fixed(event?.alpha)} / ${fixed(event?.beta)} / ${fixed(event?.gamma)}`,
    'webkit heading ± accuracy': `${fixed(event?.webkitCompassHeading)} ± ${fixed(event?.webkitCompassAccuracy)}`,
    'raw heading': fixed(raw.value?.heading),
    'shown heading': fixed(heading.value),
    'declination': fixed(declination.value, 2),
    'true heading': fixed(trueHeading.value),
    'tilt': fixed(raw.value?.tilt),
    'gyro drift': fixed(drifted.value),
    'flags': [
      hasReading.value && 'reading',
      sideways.value && 'sideways',
      upright.value && 'upright',
      disturbed.value && 'disturbed',
    ]
      .filter(Boolean)
      .join(' '),
    'problem': problem.value ?? 'none',
    'qibla': fixed(qiblaDirection.value, 3),
    'location': `${fixed(latitude.value, 5)}, ${fixed(longitude.value, 5)}${usingSavedLocation.value ? ' (saved)' : ''}`,
    'location accuracy': `${fixed(locationAccuracy.value, 0)} m → ±${fixed(uncertainty.value, 2)}°`,
    'sun azimuth': fixed(sunAzimuth.value),
  }
})

onMounted(() => {
  if (hasLocation.value) refreshLocation()
  else requestLocation()
})
</script>

<template>
  <Page class="qibla-page full-height">
    <Heading
      subtitle-desktop-only
      title="اتجاه القبلة"
      subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية."
    />

    <div class="qibla-page__body">
      <LoadingState v-if="locationLoading" message="جاري تحديد موقعك..." />

      <StatePanel v-else-if="locationError" :icon="IconMapPinOff" title="تعذّر تحديد موقعك" :message="locationError">
        <button type="button" class="btn btn-soft" @click="requestLocation">إعادة المحاولة</button>
      </StatePanel>

      <!-- Only the request until allowed (iOS), so a resting tape isn't mistaken for a working compass. -->
      <StatePanel
        v-else-if="awaitingCompass"
        :icon="IconCompass"
        title="تفعيل البوصلة"
        :message="compassError || 'اسمح للتطبيق باستخدام البوصلة لتحديد اتجاه القبلة.'"
      >
        <button type="button" class="btn btn-primary" @click="requestPermission">تفعيل البوصلة</button>
      </StatePanel>

      <StatePanel
        v-else-if="problemPanel"
        :icon="problemPanel.icon"
        :title="problemPanel.title"
        :message="problemPanel.message"
      >
        <QiblaLocationNote
          v-if="BEARING_PROBLEMS.has(problem) && qiblaDirection !== null"
          :distance="distance"
          :saved-location="usingSavedLocation"
          :refreshing-location="refreshingLocation"
          :imprecise-location="impreciseLocation"
          @refresh-location="refreshLocation"
        />
      </StatePanel>

      <LoadingState v-else-if="startingCompass" message="جاري تشغيل البوصلة..." />

      <QiblaCompass
        v-else-if="qiblaDirection !== null"
        :qibla-direction="qiblaDirection"
        :distance="distance"
        :heading="trueHeading"
        :live="live"
        :trusted="trusted"
        :accuracy="accuracy"
        :uncertainty="impreciseLocation ? uncertainty : null"
        :sun-azimuth="sunAzimuth"
        :saved-location="usingSavedLocation"
        :refreshing-location="refreshingLocation"
        @refresh-location="refreshLocation"
      />

      <QiblaDebug v-if="debugging" :values="debugValues" />
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.qibla-page {
  display: grid;
  grid-template-rows: auto 1fr;
}

.qibla-page__body {
  display: grid;
  place-items: center;
  padding-block: 1rem 2rem;
}
</style>
