import { ref, computed, onMounted, onUnmounted } from 'vue'
import { normalizeAngle, smoothAngle } from '@/features/qibla/lib/qibla'

const SMOOTHING = 0.15

const needsPermissionPrompt = () =>
  typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'

export function useDeviceCompass() {
  const heading = ref(0)
  const hasSupport = ref(false)
  // Desktop browsers expose the orientation API without ever firing it, so only a real reading means a live compass.
  const hasReading = ref(false)
  const error = ref(null)

  const canRequestPermission = computed(() => !hasSupport.value && needsPermissionPrompt())

  function update(rawHeading) {
    // The first reading jumps straight to the heading instead of sweeping there from north.
    heading.value = hasReading.value ? smoothAngle(heading.value, rawHeading, SMOOTHING) : normalizeAngle(rawHeading)
    hasReading.value = true
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

  // Where the browser asks for permission, the request only works from a tap, so wait for the "enable" button.
  onMounted(() => {
    if (!needsPermissionPrompt()) requestPermission()
  })
  onUnmounted(() => {
    window.removeEventListener('deviceorientation', handleOrientation, true)
    window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
  })

  return { heading, hasSupport, hasReading, error, canRequestPermission, requestPermission }
}
