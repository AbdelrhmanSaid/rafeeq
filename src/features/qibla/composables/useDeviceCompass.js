import { ref, computed, onMounted, onUnmounted } from 'vue'
import { headingFromOrientation, isHeldSideways, normalizeAngle, smoothAngle } from '@/features/qibla/lib/qibla'

const SMOOTHING = 0.15

const needsPermissionPrompt = () =>
  typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'

export function useDeviceCompass() {
  const heading = ref(0)
  const hasSupport = ref(false)
  // Desktop browsers expose the orientation API without ever firing it, so only a real reading means a live compass.
  const hasReading = ref(false)
  // iOS reports how far off its heading may be, in degrees (negative when it can't tell). Null where unknown.
  const accuracy = ref(null)
  // Held on its side (landscape, even with rotation lock): the heading isn't reliable then.
  const sideways = ref(false)
  const error = ref(null)

  const canRequestPermission = computed(() => !hasSupport.value && needsPermissionPrompt())

  function update(rawHeading) {
    // The first reading jumps straight to the heading instead of sweeping there from north.
    heading.value = hasReading.value ? smoothAngle(heading.value, rawHeading, SMOOTHING) : normalizeAngle(rawHeading)
    hasReading.value = true
  }

  function trackPose(event) {
    if (event.beta != null && event.gamma != null) sideways.value = isHeldSideways(event.beta, event.gamma)
  }

  function handleOrientation(event) {
    trackPose(event)

    // iOS reports a ready-made compass heading (from magnetic north) and its accuracy. With no heading available it
    // sends 0 with an accuracy of -1, which must not count as a reading of north.
    if (event.webkitCompassHeading != null) {
      accuracy.value = event.webkitCompassAccuracy ?? null
      if (accuracy.value != null && accuracy.value < 0) return
      update(event.webkitCompassHeading)
      return
    }

    // Elsewhere only an absolute reading is measured from north; a relative one starts wherever the phone was
    // when the page opened, and would point the compass anywhere.
    if (event.absolute && event.alpha !== null) {
      update(headingFromOrientation(event.alpha, event.beta ?? 0, event.gamma ?? 0))
    }
  }

  function handleAbsoluteOrientation(event) {
    trackPose(event)
    if (event.alpha !== null) update(headingFromOrientation(event.alpha, event.beta ?? 0, event.gamma ?? 0))
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

  return { heading, hasSupport, hasReading, accuracy, sideways, error, canRequestPermission, requestPermission }
}
