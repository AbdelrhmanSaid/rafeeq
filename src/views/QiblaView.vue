<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFetch, useOnline, useMediaQuery } from '@vueuse/core'
import { IconCompass, IconLocationFilled, IconDeviceMobile } from '@tabler/icons-vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import OfflineState from '@/components/OfflineState.vue'
import { toArabicNumerals } from '@/utilities/arabic'

const online = useOnline()

// Check if device is mobile (screen width < 992px, matching Bootstrap lg breakpoint)
const isMobile = useMediaQuery('(max-width: 991.98px)')

// Location state (fresh from navigator, not stored)
const latitude = ref(null)
const longitude = ref(null)
const locationLoading = ref(true)
const locationError = ref(null)

// Compass state
const smoothedHeading = ref(0)
const hasCompassSupport = ref(false)
const compassError = ref(null)

// Smoothing factor for exponential moving average (0-1)
// 0.15 provides good balance between responsiveness and stability
// Lower values = smoother but slower, higher = faster but jittery
const SMOOTHING = 0.15

// Tolerance in degrees for "facing Qibla" detection
// 15° allows for natural hand movement while being precise enough for prayer
const FACING_TOLERANCE = 15

// Request fresh location from navigator
function requestLocation() {
  locationLoading.value = true
  locationError.value = null

  if (!navigator.geolocation) {
    locationError.value = 'الموقع الجغرافي غير مدعوم في هذا المتصفح'
    locationLoading.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude
      locationLoading.value = false
    },
    (err) => {
      locationLoading.value = false
      if (err.code === err.PERMISSION_DENIED) {
        locationError.value = 'تم رفض إذن الوصول للموقع'
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        locationError.value = 'الموقع غير متاح حالياً'
      } else {
        locationError.value = 'فشل في تحديد الموقع'
      }
    },
    { enableHighAccuracy: true, timeout: 15000 },
  )
}

// API endpoint for Qibla direction
const endpoint = computed(() => {
  if (!latitude.value || !longitude.value) return null
  return `https://api.aladhan.com/v1/qibla/${latitude.value}/${longitude.value}`
})

const fetchOptions = {
  refetch: true,
  beforeFetch: ({ url, cancel }) => {
    if (!url) cancel()
  },
}

const { isFetching, data: qiblaData, error } = useFetch(endpoint, fetchOptions).json().get()

// Qibla direction from API (degrees from North)
const qiblaDirection = computed(() => {
  const direction = qiblaData.value?.data?.direction
  return typeof direction === 'number' ? direction : null
})

// Calculate shortest rotation path (handles 0/360 wraparound)
function normalizeAngle(angle) {
  while (angle < 0) angle += 360
  while (angle >= 360) angle -= 360
  return angle
}

function getShortestRotation(from, to) {
  const diff = normalizeAngle(to - from)
  return diff > 180 ? diff - 360 : diff
}

// Apply smoothing with wraparound handling
function smoothHeading(newValue) {
  const delta = getShortestRotation(smoothedHeading.value, newValue)
  smoothedHeading.value = normalizeAngle(smoothedHeading.value + delta * SMOOTHING)
}

// The rotation angle for the Qibla arrow
// When facing Qibla, this should be 0 (pointing up)
const needleRotation = computed(() => {
  if (qiblaDirection.value === null) return 0
  const angle = qiblaDirection.value - smoothedHeading.value
  return normalizeAngle(angle)
})

// Check if facing Qibla (within tolerance)
const isFacingQibla = computed(() => {
  if (!hasCompassSupport.value || qiblaDirection.value === null) return false
  const angle = needleRotation.value
  return angle <= FACING_TOLERANCE || angle >= 360 - FACING_TOLERANCE
})

// Check if iOS permission request is available
const canRequestiOSPermission = computed(() => {
  return (
    !hasCompassSupport.value &&
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  )
})

// Handle device orientation events
function handleOrientation(event) {
  let heading = 0

  // iOS: use webkitCompassHeading (degrees from magnetic north)
  if (event.webkitCompassHeading !== undefined) {
    heading = event.webkitCompassHeading
  }
  // Android/others: use alpha (but needs to be converted)
  else if (event.alpha !== null) {
    // alpha is rotation around z-axis, 0-360
    // When device points North, alpha varies by device
    // For absolute orientation, we need deviceorientationabsolute event
    heading = normalizeAngle(360 - event.alpha)
  }

  smoothHeading(heading)
}

// Handle absolute orientation (Android)
function handleAbsoluteOrientation(event) {
  if (event.alpha !== null) {
    const heading = normalizeAngle(360 - event.alpha)
    smoothHeading(heading)
  }
}

async function requestCompassPermission() {
  // iOS 13+ requires permission
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission === 'granted') {
        hasCompassSupport.value = true
        window.addEventListener('deviceorientation', handleOrientation, true)
      } else {
        compassError.value = 'تم رفض إذن الوصول للبوصلة'
      }
    } catch (err) {
      console.error('Compass permission error:', err)
      compassError.value = 'فشل في طلب إذن البوصلة'
    }
  } else if (window.DeviceOrientationEvent) {
    hasCompassSupport.value = true

    // Try absolute orientation first (better for Android)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }
  } else {
    compassError.value = 'البوصلة غير مدعومة في هذا الجهاز'
  }
}

onMounted(() => {
  requestLocation()
  requestCompassPermission()
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', handleOrientation, true)
  window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
})
</script>

<template>
  <Page>
    <Heading class="mb-4" title="اتجاه القبلة" subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية." />

    <!-- Desktop not supported -->
    <div v-if="!isMobile" class="qibla-card qibla-card--static text-center">
      <IconDeviceMobile size="3rem" class="text-muted mb-3" />
      <p class="h5 mb-2">هذه الميزة متاحة فقط على الهاتف</p>
      <p class="text-muted mb-0">افتح التطبيق من هاتفك لاستخدام البوصلة</p>
    </div>

    <!-- Offline state -->
    <div v-else-if="!online" class="qibla-card qibla-card--static">
      <OfflineState />
    </div>

    <!-- Location loading -->
    <div v-else-if="locationLoading" class="qibla-card qibla-card--static">
      <LoadingState message="جاري تحديد موقعك..." />
    </div>

    <!-- Location error -->
    <div v-else-if="locationError" class="qibla-card qibla-card--clickable text-center" @click="requestLocation">
      <IconLocationFilled size="3rem" class="text-danger mb-3" />
      <p class="mb-2">{{ locationError }}</p>
      <p class="text-muted small mb-0">إضغط للمحاولة مرة أخرى</p>
    </div>

    <!-- Qibla API loading -->
    <div v-else-if="isFetching" class="qibla-card qibla-card--static">
      <LoadingState message="جاري تحديد اتجاه القبلة..." />
    </div>

    <!-- Qibla API error -->
    <div v-else-if="error" class="qibla-card qibla-card--static">
      <OfflineState v-if="!online" />
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." v-else />
    </div>

    <!-- Qibla compass -->
    <div v-else-if="qiblaData && qiblaDirection !== null" class="qibla-shell">
      <div class="compass-container" :class="{ 'facing-qibla': isFacingQibla }">
        <!-- Qibla needle - points to Qibla direction -->
        <div class="needle" :style="{ transform: `rotate(${needleRotation}deg)` }">
          <div class="needle-pointer"></div>
          <div class="kaaba-icon">🕋</div>
        </div>

        <!-- Center dot -->
        <div class="center-dot"></div>

        <!-- "You" indicator at bottom -->
        <div class="you-indicator">
          <span>أنت</span>
        </div>
      </div>

      <!-- Info section -->
      <div class="qibla-info">
        <div class="qibla-degree">
          <IconCompass size="1.25rem" class="me-2" />
          <span>{{ toArabicNumerals(qiblaDirection.toFixed(1)) }}° من الشمال</span>
        </div>
        <p class="qibla-hint">
          <template v-if="hasCompassSupport && !compassError">
            <span v-if="isFacingQibla" class="text-success fw-bold">أنت تواجه القبلة!</span>
            <span v-else>أدر هاتفك حتى تشير الكعبة للأعلى</span>
          </template>
          <template v-else>
            <span class="text-warning">{{ compassError || 'البوصلة غير متاحة' }}</span>
          </template>
        </p>
      </div>

      <!-- Enable compass button for iOS -->
      <button v-if="canRequestiOSPermission" class="btn btn-primary" @click="requestCompassPermission">
        <IconCompass class="me-2" size="1.25rem" />
        تفعيل البوصلة
      </button>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.qibla-card {
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 3rem;
  transition: border-color 0.2s;

  &--clickable {
    cursor: pointer;

    &:hover {
      border-color: var(--bs-primary);
    }
  }

  &--static {
    cursor: default;
  }
}

.qibla-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
}

.compass-container {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bs-body-bg) 0%, var(--bs-secondary-bg) 100%);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 3px solid var(--bs-border-color);
  transition:
    border-color 0.3s,
    box-shadow 0.3s;

  &.facing-qibla {
    border-color: var(--bs-success);
    box-shadow:
      0 0 0 4px rgba(var(--bs-success-rgb), 0.2),
      0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 50%;
  margin-left: -2px;
  margin-top: -50%;
  transform-origin: bottom center;
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;
}

.needle-pointer {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 24px solid var(--bs-primary);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.kaaba-icon {
  font-size: 1.75rem;
  margin-top: 4px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15));
}

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: var(--bs-primary);
  border-radius: 50%;
  border: 3px solid var(--bs-body-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.you-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bs-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.qibla-info {
  text-align: center;
}

.qibla-degree {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--bs-primary);
  margin-bottom: 0.5rem;
}

.qibla-hint {
  color: var(--bs-secondary-color);
  margin: 0;
  font-size: 0.95rem;
}
</style>
