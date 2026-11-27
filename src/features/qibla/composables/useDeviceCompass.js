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

// The shown heading eases toward the latest reading with this time constant.
const SMOOTHING_MS = 100
// With no sign of life from the sensors for this long, the last heading is no longer live.
const STALE_MS = 1000
// iOS gives the heading of the phone's top edge, which means nothing once the phone stands up: past this tilt from
// flat the heading isn't used.
const MAX_TILT = 60
// The compass and the gyroscope disagreeing by more than this within a few seconds means magnetic interference.
const MAX_DRIFT = 15
const DRIFT_WINDOW_MS = 6000
// The compass trails a turning phone by a second or so, so it's only compared with the gyroscope after this long at rest;
// mid-turn the lag alone reads as interference.
const STEADY_MS = 1000
// A phone turning slower than this (degrees a second) is at rest.
const REST_RATE = 5

const needsPermissionPrompt = () =>
  typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'

const now = () => performance.now()

export function useDeviceCompass() {
  const heading = ref(0)
  const hasSupport = ref(false)
  // Desktop browsers expose the orientation API without ever firing it, so only a real reading means a live compass.
  const hasReading = ref(false)
  // Whether any reading has arrived: a compass that went quiet is paused, not missing.
  const hadReading = ref(false)
  // iOS reports how far off its heading may be, in degrees (negative when it can't tell). Null where unknown.
  const accuracy = ref(null)
  const sideways = ref(false)
  // Tipped up too far for a heading that is measured along the phone's top edge (iOS).
  const upright = ref(false)
  // The compass disagrees with the gyroscope: a magnet or metal nearby, or it needs calibrating.
  const disturbed = ref(false)
  // Degrees the compass-minus-gyroscope gap has wandered lately.
  const drifted = ref(0)
  const error = ref(null)
  // The latest raw sensor values, for the debug readout.
  const raw = shallowRef(null)

  const canRequestPermission = computed(() => !hasSupport.value && needsPermissionPrompt())

  // Browsers only send a reading when it changes, so easing a step per reading would stop short of the last one and
  // leave the tape a few degrees off once the phone is still. Ease by the clock instead, until it gets there.
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

  // If the sensors go quiet the last heading is no longer live, and mustn't keep saying the phone faces the qibla.
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
      // The first reading jumps straight to the heading instead of sweeping there from north.
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

  // The heading from the gyroscope alone: right about turns, with no idea where north is.
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
    // Old disagreement says nothing about now: with no fresh comparison for a while, start over.
    clearTimeout(driftTimer)
    driftTimer = setTimeout(clearDrift, DRIFT_WINDOW_MS)
  }

  function handleOrientation(event) {
    trackPose(event)

    // iOS reports a ready-made compass heading (from magnetic north) and its accuracy. With no heading available it
    // sends 0 with an accuracy of -1, which must not count as a reading of north.
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

    // Elsewhere only an absolute reading is measured from north; a relative one starts wherever the phone was
    // when the page opened, and would point the compass anywhere.
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

  // A phone lying still sends no orientation readings, since nothing changes, but its motion sensors keep reporting.
  // While they say it's at rest, the last heading still holds.
  function handleMotion(event) {
    const rate = event.rotationRate
    if (!rate || rate.alpha == null) return
    const time = now()
    if (Math.hypot(rate.alpha, rate.beta ?? 0, rate.gamma ?? 0) >= REST_RATE) {
      turnedAt = time
      return
    }
    // At rest the gyroscope's heading sends nothing new either, and still holds.
    if (gyroHeading !== null) gyroAt = time
    if (hasReading.value) keepAlive()
  }

  // Chrome (Android included) has the iOS permission prompt too, so pick the event by what the browser offers, not by
  // whether it asked first.
  let active = true

  function listen() {
    // The permission answer can land after the screen has closed.
    if (!active) return
    hasSupport.value = true
    // A refusal from an earlier tap no longer applies.
    error.value = null
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true)
      window.addEventListener('deviceorientation', handleRelativeOrientation, true)
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }
    window.addEventListener('devicemotion', handleMotion, true)
  }

  // Quiet: the try on opening the screen. Browsers that need a tap refuse it, which isn't an error worth showing.
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
