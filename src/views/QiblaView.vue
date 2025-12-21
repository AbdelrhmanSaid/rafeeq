<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import { useFetch, useOnline } from '@vueuse/core'
import { IconCompass, IconLocationFilled } from '@tabler/icons-vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import OfflineState from '@/components/OfflineState.vue'

const online = useOnline()
const store = useCoordinatesStore()

// Compass state
const rawHeading = ref(0)
const smoothedHeading = ref(0)
const hasCompassSupport = ref(false)
const compassError = ref(null)

// Smoothing factor (0-1, higher = smoother but slower response)
const SMOOTHING = 0.15

// API endpoint for Qibla direction
const endpoint = computed(() => {
  if (!store.latitude || !store.longitude) return null
  return `https://api.aladhan.com/v1/qibla/${store.latitude}/${store.longitude}`
})

const options = {
  refetch: true,
  beforeFetch: ({ url, cancel }) => {
    if (!url) cancel()
  },
}

const { isFetching, data: qiblaData, error } = useFetch(endpoint, options).json().get()

// Qibla direction from API (degrees from North)
const qiblaDirection = computed(() => {
  return qiblaData.value?.data?.direction || 0
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
  const angle = qiblaDirection.value - smoothedHeading.value
  return normalizeAngle(angle)
})

// Check if facing Qibla (within 15 degrees)
const isFacingQibla = computed(() => {
  if (!hasCompassSupport.value) return false
  const angle = needleRotation.value
  return angle <= 15 || angle >= 345
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

  rawHeading.value = heading
  smoothHeading(heading)
}

// Handle absolute orientation (Android)
function handleAbsoluteOrientation(event) {
  if (event.alpha !== null) {
    const heading = normalizeAngle(360 - event.alpha)
    rawHeading.value = heading
    smoothHeading(heading)
  }
}

async function requestCompassPermission() {
  // iOS 13+ requires permission
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission === 'granted') {
        hasCompassSupport.value = true
        window.addEventListener('deviceorientation', handleOrientation, true)
      } else {
        compassError.value = 'تم رفض إذن الوصول للبوصلة'
      }
    } catch {
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
  requestCompassPermission()
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', handleOrientation, true)
  window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
})
</script>

<template>
  <Page>
    <Heading
      class="mb-4"
      title="اتجاه القبلة"
      subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية."
    />

    <!-- No location set -->
    <div
      v-if="store.latitude === 0 || store.longitude === 0"
      class="qibla-card text-center"
      @click="store.detect"
    >
      <IconLocationFilled size="3rem" class="text-primary mb-3" />
      <p class="mb-0">إضغط هنا لتحديد الموقع الخاص بك</p>
    </div>

    <!-- Loading state -->
    <div v-else-if="isFetching" class="qibla-card">
      <LoadingState />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="qibla-card">
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
    </div>

    <!-- Offline state -->
    <div v-else-if="!online" class="qibla-card">
      <OfflineState />
    </div>

    <!-- Qibla compass -->
    <div v-else-if="qiblaData" class="qibla-shell">
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
          <span>{{ qiblaDirection.toFixed(1) }}° من الشمال</span>
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
      <button
        v-if="!hasCompassSupport && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'"
        class="btn btn-primary"
        @click="requestCompassPermission"
      >
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
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--bs-primary);
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
