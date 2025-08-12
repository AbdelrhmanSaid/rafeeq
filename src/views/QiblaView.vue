<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import Heading from '@/components/Heading.vue'
import OfflineState from '@/components/OfflineState.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import { useOnline } from '@vueuse/core'

const online = useOnline()
const coordsStore = useCoordinatesStore()

const hasOrientation = ref(false)
const permissionDenied = ref(false)
const loading = ref(true)
const error = ref(null)

const deviceAlpha = ref(0)
const qiblaBearing = ref(null)

const isCoordsSet = computed(() => coordsStore.latitude !== 0 && coordsStore.longitude !== 0)

function toRadians(deg) {
  return (deg * Math.PI) / 180
}

function toDegrees(rad) {
  return (rad * 180) / Math.PI
}

// Calculate initial bearing from current location to Kaaba
function calculateQiblaBearing(lat, lon) {
  const kaabaLat = toRadians(21.4225)
  const kaabaLon = toRadians(39.8262)
  const phi1 = toRadians(lat)
  const lambda1 = toRadians(lon)
  const y = Math.sin(kaabaLon - lambda1) * Math.cos(kaabaLat)
  const x =
    Math.cos(phi1) * Math.sin(kaabaLat) -
    Math.sin(phi1) * Math.cos(kaabaLat) * Math.cos(kaabaLon - lambda1)
  const theta = Math.atan2(y, x)
  const bearing = (toDegrees(theta) + 360) % 360
  return bearing
}

function updateQiblaBearing() {
  if (!isCoordsSet.value) return
  qiblaBearing.value = calculateQiblaBearing(coordsStore.latitude, coordsStore.longitude)
}

function onOrientation(e) {
  // Prefer webkitCompassHeading when available (iOS)
  const heading = typeof e.webkitCompassHeading === 'number' ? e.webkitCompassHeading : 360 - (e.alpha || 0)
  deviceAlpha.value = (heading + 360) % 360
}

async function requestPermissionIfNeeded() {
  try {
    const anyDevOrient = 'ondeviceorientationabsolute' in window || 'ondeviceorientation' in window
    if (!anyDevOrient) return false

    // iOS 13+ permission model
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const res = await DeviceOrientationEvent.requestPermission()
      if (res !== 'granted') {
        permissionDenied.value = true
        return false
      }
    }
    return true
  } catch (err) {
    // Some browsers throw if not needed
    return true
  }
}

onMounted(async () => {
  try {
    if (!isCoordsSet.value) {
      coordsStore.detect()
    } else {
      updateQiblaBearing()
    }

    const ok = await requestPermissionIfNeeded()
    if (ok) {
      window.addEventListener('deviceorientation', onOrientation, true)
      hasOrientation.value = true
    }
  } catch (e) {
    error.value = 'تعذر الوصول إلى مستشعرات الاتجاه في هذا الجهاز.'
  } finally {
    loading.value = false
  }
})

// Recompute bearing when coordinates change
watch(
  () => [coordsStore.latitude, coordsStore.longitude],
  () => updateQiblaBearing(),
)

onUnmounted(() => {
  window.removeEventListener('deviceorientation', onOrientation, true)
})

const pointerRotation = computed(() => {
  if (qiblaBearing.value == null) return 0
  // rotation needed so that pointer (drawn pointing up/North) points to qibla
  const rotation = (qiblaBearing.value - deviceAlpha.value + 360) % 360
  return rotation
})

const hintText = computed(() => {
  if (!isCoordsSet.value) return 'اضغط لتحديد الموقع لعرض اتجاه القبلة'
  if (!hasOrientation.value) return 'دوّر الهاتف حتى يشير السهم للقبلة. قد تحتاج لمنح إذن حساس الاتجاه.'
  if (permissionDenied.value) return 'يرجى منح إذن الوصول إلى حساس الاتجاه من إعدادات المتصفح.'
  return 'حافظ على الهاتف مستويًا للحصول على دقة أفضل'
})
</script>

<template>
  <div class="container">
    <Heading title="اتجاه القبلة" subtitle="استدل على الاتجاه الصحيح نحو الكعبة" />

    <div v-if="loading" class="border rounded p-5"><LoadingState /></div>
    <div v-else-if="error" class="border rounded p-5"><ErrorState :code="500" :message="error" /></div>
    <div v-else-if="!online" class="border rounded p-5"><OfflineState /></div>

    <div v-else class="d-flex flex-column align-items-center gap-3">
      <div
        class="qibla-compass border rounded-circle d-flex align-items-center justify-content-center position-relative"
        :class="{ 'cursor-pointer': !isCoordsSet }"
        @click="!isCoordsSet && coordsStore.detect()"
      >
        <div class="compass-dial position-absolute w-100 h-100"></div>
        <div class="north-mark position-absolute">شمال</div>
        <div class="pointer position-absolute" :style="{ transform: `rotate(${pointerRotation}deg)` }">
          <div class="pointer-head"></div>
          <div class="pointer-tail"></div>
        </div>
        <div class="center-dot position-absolute"></div>
      </div>

      <div class="text-center small text-secondary">{{ hintText }}</div>

      <div class="d-flex gap-3 align-items-center">
        <div class="badge bg-secondary-subtle text-body">اتجاه القبلة: {{ qiblaBearing?.toFixed?.(0) || '-' }}°</div>
        <div class="badge bg-secondary-subtle text-body">اتجاه الهاتف: {{ deviceAlpha.toFixed(0) }}°</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.qibla-compass {
  width: min(80vw, 360px);
  height: min(80vw, 360px);
  background: var(--bs-body-bg);
}

.compass-dial {
  border: 10px solid var(--bs-border-color);
  border-radius: 50%;
}

.north-mark {
  top: 6px;
  right: 50%;
  transform: translateX(50%);
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

.pointer {
  width: 0;
  height: 0;
}

.pointer-head {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 32px solid var(--bs-danger);
  transform: translateY(-48px);
}

.pointer-tail {
  width: 6px;
  height: 70px;
  background: var(--bs-danger);
  transform: translate(-3px, -40px);
}

.center-dot {
  width: 10px;
  height: 10px;
  background: var(--bs-primary);
  border-radius: 50%;
}
</style>