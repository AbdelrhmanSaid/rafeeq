import { useCallback, useEffect, useState } from 'react'
import { normalizeAngle, smoothAngle } from '@/features/qibla/lib/qibla'

// Exponential-moving-average factor — balances responsiveness vs. jitter.
const SMOOTHING = 0.15

// Whether the platform requires an explicit DeviceOrientation permission prompt (iOS 13+).
const needsPermissionPrompt = () =>
  typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'

const initialPermission = () => {
  if (needsPermissionPrompt()) return 'prompt'
  return typeof window !== 'undefined' && window.DeviceOrientationEvent ? 'granted' : 'unsupported'
}

const ERRORS = {
  unsupported: 'البوصلة غير مدعومة في هذا الجهاز',
  denied: 'تم رفض إذن الوصول للبوصلة',
  failed: 'فشل في طلب إذن البوصلة',
}

// Tracks the device's compass heading from DeviceOrientation events, handling
// iOS permission, Android absolute orientation, and listener cleanup.
export function useDeviceCompass() {
  const [heading, setHeading] = useState(0)
  const [permission, setPermission] = useState(initialPermission)

  const requestPermission = useCallback(async () => {
    if (!needsPermissionPrompt()) return

    try {
      const result = await DeviceOrientationEvent.requestPermission()
      setPermission(result === 'granted' ? 'granted' : 'denied')
    } catch (error) {
      console.error('Compass permission error:', error)
      setPermission('failed')
    }
  }, [])

  useEffect(() => {
    if (permission !== 'granted') return

    const update = (raw) => setHeading((current) => smoothAngle(current, raw, SMOOTHING))

    // Android exposes an absolute (true north) orientation event; iOS reports
    // its compass heading on the standard one.
    const absolute = 'ondeviceorientationabsolute' in window
    const eventName = absolute ? 'deviceorientationabsolute' : 'deviceorientation'

    const onOrientation = (event) => {
      if (!absolute && event.webkitCompassHeading !== undefined) update(event.webkitCompassHeading)
      else if (event.alpha !== null) update(normalizeAngle(360 - event.alpha))
    }

    window.addEventListener(eventName, onOrientation, true)
    return () => window.removeEventListener(eventName, onOrientation, true)
  }, [permission])

  return {
    heading,
    hasSupport: permission === 'granted',
    error: ERRORS[permission] ?? null,
    canRequestPermission: permission === 'prompt',
    requestPermission,
  }
}
