<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import { useFetch, useOnline } from '@vueuse/core'
import { IconCompass, IconLocationFilled } from '@tabler/icons-vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import OfflineState from '@/components/OfflineState.vue'

// Check if the user is online
const online = useOnline()

// Coordinates store
const store = useCoordinatesStore()

// Device heading (compass direction the phone is pointing)
const deviceHeading = ref(0)
const hasCompassSupport = ref(false)
const compassError = ref(null)

// API endpoint for Qibla direction
const endpoint = computed(() => {
  if (!store.latitude || !store.longitude) return null
  return `https://api.aladhan.com/v1/qibla/${store.latitude}/${store.longitude}`
})

// Fetch options
const options = {
  refetch: true,
  beforeFetch: ({ url, cancel }) => {
    if (!url) cancel()
  },
}

// Fetch Qibla direction
const { isFetching, data: qiblaData, error } = useFetch(endpoint, options).json().get()

// Qibla direction in degrees from North
const qiblaDirection = computed(() => {
  return qiblaData.value?.data?.direction || 0
})

// Compass rotation - rotates the entire compass based on device heading
const compassRotation = computed(() => {
  return `rotate(${-deviceHeading.value}deg)`
})

// Qibla needle rotation - points to qibla relative to compass
const qiblaNeedleRotation = computed(() => {
  return `rotate(${qiblaDirection.value}deg)`
})

// Check if user is facing Qibla direction (within 10 degrees tolerance)
const isFacingQibla = computed(() => {
  if (!hasCompassSupport.value) return false
  const diff = Math.abs(deviceHeading.value - qiblaDirection.value)
  const normalizedDiff = diff > 180 ? 360 - diff : diff
  return normalizedDiff <= 10
})

// Handle device orientation
function handleOrientation(event) {
  // For iOS we need to use webkitCompassHeading
  if (event.webkitCompassHeading !== undefined) {
    deviceHeading.value = event.webkitCompassHeading
  } else if (event.alpha !== null) {
    // For Android devices, calculate heading from alpha
    // alpha is the rotation around the z-axis (0-360)
    deviceHeading.value = 360 - event.alpha
  }
}

// Request compass permission (required for iOS 13+)
async function requestCompassPermission() {
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
      compassError.value = 'فشل في طلب إذن البوصلة'
    }
  } else if (window.DeviceOrientationEvent) {
    // Non-iOS devices or older iOS
    hasCompassSupport.value = true
    window.addEventListener('deviceorientation', handleOrientation, true)
  } else {
    compassError.value = 'البوصلة غير مدعومة في هذا الجهاز'
  }
}

onMounted(() => {
  requestCompassPermission()
})

onUnmounted(() => {
  window.removeEventListener('deviceorientation', handleOrientation, true)
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
      <!-- Compass visualization -->
      <div class="compass-wrapper" :class="{ 'facing-qibla': isFacingQibla }">
        <div class="compass" :style="{ transform: compassRotation }">
          <!-- Cardinal directions -->
          <span class="cardinal cardinal-north">ش</span>
          <span class="cardinal cardinal-east">شر</span>
          <span class="cardinal cardinal-south">ج</span>
          <span class="cardinal cardinal-west">غ</span>

          <!-- Qibla indicator -->
          <div class="qibla-indicator" :style="{ transform: `rotate(${qiblaDirection}deg)` }">
            <div class="qibla-arrow">
              <span class="kaaba-icon">🕋</span>
            </div>
          </div>
        </div>

        <!-- Center point -->
        <div class="compass-center"></div>

        <!-- Direction pointer (fixed, points up) -->
        <div class="direction-pointer"></div>
      </div>

      <!-- Qibla info -->
      <div class="qibla-info">
        <div class="qibla-degree">
          <IconCompass size="1.5rem" class="me-2" />
          <span>{{ qiblaDirection.toFixed(1) }}°</span>
        </div>
        <p class="qibla-hint">
          <template v-if="hasCompassSupport && !compassError">
            <span v-if="isFacingQibla" class="text-success">أنت تواجه القبلة الآن!</span>
            <span v-else>وجّه هاتفك نحو الكعبة</span>
          </template>
          <template v-else>
            <span class="text-warning">{{ compassError || 'البوصلة غير متاحة - اتجاه القبلة موضح أعلاه' }}</span>
          </template>
        </p>
      </div>

      <!-- Enable compass button for iOS -->
      <button
        v-if="!hasCompassSupport && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'"
        class="btn btn-primary mt-3"
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
  gap: 2rem;
  padding: 2rem 1rem;
}

.compass-wrapper {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: var(--bs-body-bg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 4px solid var(--bs-border-color);
  transition: border-color 0.3s, box-shadow 0.3s;

  @media (max-width: 350px) {
    width: 250px;
    height: 250px;
  }

  &.facing-qibla {
    border-color: var(--bs-success);
    box-shadow: 0 0 30px rgba(var(--bs-success-rgb), 0.4);
  }
}

.compass {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 0.15s ease-out;
}

.cardinal {
  position: absolute;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--bs-body-color);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.cardinal-north {
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--bs-danger);
  }

  &.cardinal-south {
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
  }

  &.cardinal-east {
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
  }

  &.cardinal-west {
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.qibla-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 120px;
  margin-left: -30px;
  margin-top: -120px;
  transform-origin: center bottom;
}

.qibla-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
}

.kaaba-icon {
  font-size: 2rem;
}

.compass-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: var(--bs-primary);
  border-radius: 50%;
  border: 3px solid var(--bs-body-bg);
  z-index: 10;
}

.direction-pointer {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 16px solid var(--bs-primary);
  z-index: 20;
}

.qibla-info {
  text-align: center;
}

.qibla-degree {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bs-primary);
  margin-bottom: 0.5rem;
}

.qibla-hint {
  color: var(--bs-secondary-color);
  margin: 0;
}
</style>
