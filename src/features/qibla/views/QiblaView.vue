<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScreenOrientation } from '@vueuse/core'
import { IconCompass, IconMapPinOff } from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import StatePanel from '@/shared/ui/StatePanel.vue'
import QiblaCompass from '@/features/qibla/components/QiblaCompass.vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { usePrayersStore } from '@/features/prayers/store'
import { useDeviceCompass } from '@/features/qibla/composables/useDeviceCompass'
import { getDeclination, getDistanceToKaaba, getQiblaDirection, normalizeAngle } from '@/features/qibla/lib/qibla'

const isMobile = useIsMobile()
const prayersStore = usePrayersStore()

const isCoordinate = (value) => Number.isFinite(Number(value)) && Number(value) !== 0

// The location saved for prayer times is good enough for the qibla, so only ask when there isn't one.
const latitude = ref(isCoordinate(prayersStore.latitude) ? Number(prayersStore.latitude) : null)
const longitude = ref(isCoordinate(prayersStore.longitude) ? Number(prayersStore.longitude) : null)
const locationLoading = ref(latitude.value == null)
const locationError = ref(null)

async function requestLocation() {
  locationLoading.value = true
  locationError.value = null

  try {
    const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
    latitude.value = position.coords.latitude
    longitude.value = position.coords.longitude
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
    const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
    latitude.value = position.coords.latitude
    longitude.value = position.coords.longitude
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

const {
  heading,
  hasReading,
  accuracy,
  sideways,
  error: compassError,
  canRequestPermission,
  requestPermission,
} = useDeviceCompass()

// Phone compasses read from magnetic north; the qibla bearing is from true north, so add the local declination.
const declination = computed(() => (hasLocation.value ? getDeclination(latitude.value, longitude.value) : 0))
const trueHeading = computed(() => normalizeAngle(heading.value + declination.value))

// The heading assumes the phone is upright in portrait; turned sideways it would be a quarter turn off.
const { angle: screenAngle } = useScreenOrientation()
// Also off when the phone is on its side with rotation lock, where the screen still reports portrait.
const isPortrait = computed(() => !screenAngle.value && !sideways.value)

// iOS says how far off its compass may be; past about 20° it needs calibrating.
const needsCalibration = computed(() => accuracy.value != null && (accuracy.value < 0 || accuracy.value > 20))

// Phones with a working compass follow the phone; anywhere else the screen shows the bearing and distance.
// iOS can lose its heading after working (accuracy turns negative); the last heading must not stay on show as live.
const headingAvailable = computed(() => accuracy.value == null || accuracy.value >= 0)
const live = computed(
  () => isMobile.value && hasReading.value && headingAvailable.value && !compassError.value && isPortrait.value,
)

const awaitingCompass = computed(() => isMobile.value && canRequestPermission.value && !hasReading.value)

const notice = computed(() => {
  if (!isMobile.value) return null
  // iOS with no usable heading never produces a reading, so this comes before the reading check.
  if (accuracy.value != null && accuracy.value < 0) return 'البوصلة لا تعمل الآن، حرّك هاتفك على شكل ∞ لمعايرتها'
  if (!hasReading.value) return null
  if (!isPortrait.value) return 'أمسك الهاتف بشكل عمودي لاستخدام البوصلة'
  if (needsCalibration.value) return 'البوصلة غير دقيقة الآن، حرّك هاتفك على شكل ∞ لمعايرتها'
  return null
})

onMounted(() => {
  if (hasLocation.value) refreshLocation()
  else requestLocation()
})
</script>

<template>
  <!-- One screen tall: the title, then the compass centred in the rest. -->
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

      <!-- Where the phone asks before sharing its compass (iOS), show only the request until it's allowed, so a
           resting tape isn't mistaken for a working compass. -->
      <StatePanel
        v-else-if="awaitingCompass"
        :icon="IconCompass"
        title="تفعيل البوصلة"
        :message="compassError || 'اسمح للتطبيق باستخدام البوصلة لتحديد اتجاه القبلة.'"
      >
        <button type="button" class="btn btn-primary" @click="requestPermission">تفعيل البوصلة</button>
      </StatePanel>

      <QiblaCompass
        v-else-if="qiblaDirection !== null"
        :qibla-direction="qiblaDirection"
        :distance="distance"
        :heading="trueHeading"
        :live="live"
        :notice="notice"
        :saved-location="usingSavedLocation"
        :refreshing-location="refreshingLocation"
        @refresh-location="refreshLocation"
        :compass-error="isMobile ? compassError : null"
      />
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
