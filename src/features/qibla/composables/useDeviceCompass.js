import { ref, computed, shallowRef, onMounted, onUnmounted } from 'vue'
import {
  createDriftMonitor,
  getShortestRotation,
  headingFromOrientation,
  isHeldSideways,
  normalizeAngle,
  smoothAngle,
  tiltFromFlat,
} from '@/features/qibla/lib/qibla'

const SMOOTHING_MS = 100
const STALE_MS = 1000
// iOS's heading is the top edge's, meaningless once the phone stands up past this tilt.
const MAX_TILT = 60
// The compass and the gyroscope disagreeing by more than this within a few seconds means magnetic interference.
const MAX_DRIFT = 15
const DRIFT_WINDOW_MS = 6000
// The compass lags a turning phone by ~1 s, which mid-turn reads as interference: compare only after this long at rest.
const STEADY_MS = 1000
const REST_RATE = 5

const needsPermissionPrompt = () =>
  typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'

const now = () => performance.now()

export function useDeviceCompass() {
  const heading = ref(0)
  const hasSupport = ref(false)
  // Desktop browsers expose the orientation API without ever firing it, so only a real reading means a live compass.
  const hasReading = ref(false)
  const hadReading = ref(false)
  const accuracy = ref(null)
  const sideways = ref(false)
  const upright = ref(false)
  const disturbed = ref(false)
  const drifted = ref(0)
  const error = ref(null)
  const raw = shallowRef(null)

  const canRequestPermission = computed(() => !hasSupport.value && needsPermissionPrompt())

  // Browsers fire only on change, so easing per reading would stop short of the last one: ease by the clock.
  let target = 0
  let frame = 0
  let lastFrame = 0

  function ease(time) {
    const elapsed = Math.min(Math.max(time - lastFrame, 0), 100)
    lastFrame = time
    if (Math.abs(getShortestRotation(heading.value, target)) < 0.05) {
      heading.value = target
      frame = 0
      return
    }
    heading.value = smoothAngle(heading.value, target, 1 - Math.exp(-elapsed / SMOOTHING_MS))
    frame = requestAnimationFrame(ease)
  }

  // A stale heading mustn't keep saying the phone faces the qibla.
  let staleTimer = 0
  const drift = createDriftMonitor({ windowMs: DRIFT_WINDOW_MS })
  let driftTimer = 0

  function clearDrift() {
    clearTimeout(driftTimer)
    drift.reset()
    drifted.value = 0
    disturbed.value = false
  }

  function keepAlive() {
    clearTimeout(staleTimer)
    staleTimer = setTimeout(() => {
      hasReading.value = false
      // The gyroscope may start from a new reference when readings return.
      clearDrift()
    }, STALE_MS)
  }

  function update(rawHeading) {
    target = normalizeAngle(rawHeading)
    if (!hasReading.value) {
      heading.value = target
    } else if (!frame) {
      lastFrame = now()
      frame = requestAnimationFrame(ease)
    }
    hasReading.value = true
    hadReading.value = true
    keepAlive()
  }

  function trackPose(event) {
    if (event.beta != null && event.gamma != null) sideways.value = isHeldSideways(event.beta, event.gamma)
  }

  let gyroHeading = null
  let gyroAt = 0
  let turnedAt = 0

  function trackGyro(gyro) {
    const time = now()
    if (gyroHeading === null) {
      turnedAt = time
    } else {
      const rate = (Math.abs(getShortestRotation(gyroHeading, gyro)) * 1000) / Math.max(time - gyroAt, 5)
      if (rate > REST_RATE) turnedAt = time
    }
    gyroHeading = gyro
    gyroAt = time
  }

  function compareWithGyro(compassHeading) {
    const time = now()
    if (gyroHeading === null || time - gyroAt > 200 || time - turnedAt < STEADY_MS || sideways.value) return
    drifted.value = drift.add(normalizeAngle(compassHeading - gyroHeading), time)
    disturbed.value = drifted.value > MAX_DRIFT
    clearTimeout(driftTimer)
    driftTimer = setTimeout(clearDrift, DRIFT_WINDOW_MS)
  }

  function handleOrientation(event) {
    trackPose(event)

    // With no heading iOS sends 0 with accuracy -1, which must not count as north.
    if (event.webkitCompassHeading != null) {
      accuracy.value = event.webkitCompassAccuracy ?? null
      if (accuracy.value != null && accuracy.value < 0) return

      const tilt = event.beta != null && event.gamma != null ? tiltFromFlat(event.beta, event.gamma) : 0
      upright.value = tilt > MAX_TILT
      raw.value = { source: 'webkitCompassHeading', event, heading: event.webkitCompassHeading, tilt }

      // Stood up, the top edge points at the sky and its heading swings round by 180°: keep the last good one.
      if (upright.value) {
        if (hasReading.value) keepAlive()
        return
      }

      // iOS's alpha turns with the phone from wherever it started; 360 - alpha is its top edge, like the heading.
      if (event.alpha != null) {
        trackGyro(normalizeAngle(360 - event.alpha))
        compareWithGyro(event.webkitCompassHeading)
      }
      update(event.webkitCompassHeading)
      return
    }

    // Elsewhere only an absolute reading is north-based; a relative one starts wherever the phone was.
    if (event.absolute && event.alpha !== null) {
      const absolute = headingFromOrientation(event.alpha, event.beta ?? 0, event.gamma ?? 0)
      raw.value = { source: 'deviceorientation (absolute)', event, heading: absolute }
      update(absolute)
    }
  }

  function handleAbsoluteOrientation(event) {
    trackPose(event)
    if (event.alpha === null) return

    const absolute = headingFromOrientation(event.alpha, event.beta ?? 0, event.gamma ?? 0)
    raw.value = { source: 'deviceorientationabsolute', event, heading: absolute }
    compareWithGyro(absolute)
    update(absolute)
  }

  // Beside the absolute event, the plain one is relative: the gyroscope's view of the same turns.
  function handleRelativeOrientation(event) {
    if (event.absolute || event.alpha == null) return
    trackGyro(headingFromOrientation(event.alpha, event.beta ?? 0, event.gamma ?? 0))
  }

  // A still phone sends no orientation events but keeps sending motion; while at rest the last heading holds.
  function handleMotion(event) {
    const rate = event.rotationRate
    if (!rate || rate.alpha == null) return
    const time = now()
    if (Math.hypot(rate.alpha, rate.beta ?? 0, rate.gamma ?? 0) >= REST_RATE) {
      turnedAt = time
      return
    }
    if (gyroHeading !== null) gyroAt = time
    if (hasReading.value) keepAlive()
  }

  // Chrome (Android too) has the iOS permission prompt, so pick the event by what the browser offers.
  let active = true

  function listen() {
    // The permission answer can land after the screen has closed.
    if (!active) return
    hasSupport.value = true
    error.value = null
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
      window.addEventListener('deviceorientation', handleRelativeOrientation, true)
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }
    window.addEventListener('devicemotion', handleMotion, true)
  }

  // Browsers that need a tap refuse the quiet try on open; not an error worth showing.
  async function ask(quiet) {
    if (needsPermissionPrompt()) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') listen()
        else if (!quiet) error.value = 'تم رفض إذن الوصول للبوصلة'
      } catch (err) {
        if (quiet) return
        console.error('Compass permission error:', err)
        error.value = 'فشل في طلب إذن البوصلة'
      }
    } else if (window.DeviceOrientationEvent) {
      listen()
    } else {
      error.value = 'البوصلة غير مدعومة في هذا الجهاز'
    }
  }

  const requestPermission = () => ask(false)

  onMounted(() => ask(true))
  onUnmounted(() => {
    active = false
    clearTimeout(staleTimer)
    clearTimeout(driftTimer)
    cancelAnimationFrame(frame)
    window.removeEventListener('deviceorientation', handleOrientation, true)
    window.removeEventListener('deviceorientation', handleRelativeOrientation, true)
    window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
    window.removeEventListener('devicemotion', handleMotion, true)
  })

  return {
    heading,
    hasSupport,
    hasReading,
    hadReading,
    accuracy,
    sideways,
    upright,
    disturbed,
    drifted,
    error,
    raw,
    canRequestPermission,
    requestPermission,
  }
}
