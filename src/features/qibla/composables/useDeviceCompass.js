import { ref, computed, onMounted, onUnmounted } from 'vue'
import { normalizeAngle, smoothAngle } from '@/features/qibla/lib/qibla'

// Exponential-moving-average factor — balances responsiveness vs. jitter.
const SMOOTHING = 0.15

// Whether the platform requires an explicit DeviceOrientation permission prompt (iOS 13+).
const needsPermissionPrompt = () =>
  typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'

// Tracks the device's compass heading from DeviceOrientation events, handling
// iOS permission, Android absolute orientation, and listener cleanup.
export function useDeviceCompass() {
  const heading = ref(0)
  const hasSupport = ref(false)
  const error = ref(null)

  const canRequestPermission = computed(() => !hasSupport.value && needsPermissionPrompt())

  function update(rawHeading) {
    heading.value = smoothAngle(heading.value, rawHeading, SMOOTHING)
  }

  function handleOrientation(event) {
    let raw = 0
    if (event.webkitCompassHeading !== undefined) {
      raw = event.webkitCompassHeading
    } else if (event.alpha !== null) {
      raw = normalizeAngle(360 - event.alpha)
    }
    update(raw)
  }

  function handleAbsoluteOrientation(event) {
    if (event.alpha !== null) update(normalizeAngle(360 - event.alpha))
  }

  async function requestPermission() {
    if (needsPermissionPrompt()) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          hasSupport.value = true
          window.addEventListener('deviceorientation', handleOrientation, true)
        } else {
          error.value = 'تم رفض إذن الوصول للبوصلة'
        }
      } catch (err) {
        console.error('Compass permission error:', err)
        error.value = 'فشل في طلب إذن البوصلة'
      }
    } else if (window.DeviceOrientationEvent) {
      hasSupport.value = true
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true)
      }
    } else {
      error.value = 'البوصلة غير مدعومة في هذا الجهاز'
    }
  }

  onMounted(requestPermission)
  onUnmounted(() => {
    window.removeEventListener('deviceorientation', handleOrientation, true)
    window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
  })

  return { heading, hasSupport, error, canRequestPermission, requestPermission }
}
