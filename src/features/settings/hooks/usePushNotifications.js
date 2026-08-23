import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import OneSignal from 'react-onesignal'

import { oneSignalReady } from '@/app/pwa/oneSignal'

// If the SDK hasn't reported in by then (blocked request, unsupported
// environment that neither resolves nor rejects), show push as unavailable
// rather than "loading" forever. Init keeps running; if it does succeed later
// the UI flips back to available.
const READY_TIMEOUT_MS = 15_000

// Wraps the OneSignal push-subscription lifecycle for this device.
export function usePushNotifications() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(true)

  const toggle = useCallback(async () => {
    try {
      const subscription = OneSignal.User.PushSubscription

      if (subscription.optedIn === true) {
        await subscription.optOut()
        toast.success('تم إيقاف الإشعارات')
      } else {
        await OneSignal.Notifications.requestPermission()
        await subscription.optIn()
        toast.success('تم تفعيل الإشعارات')
      }

      setEnabled(OneSignal.User.PushSubscription.optedIn === true)
    } catch (error) {
      console.error('Push toggle failed:', error)
      toast.error('تعذّر تغيير حالة الإشعارات')
    }
  }, [])

  useEffect(() => {
    // The OneSignal SDK loads and initializes asynchronously. During init the
    // User.PushSubscription namespace is reconstructed (and the subscription is
    // re-established via auto-resubscribe) AFTER the first OneSignalDeferred
    // callback runs. So an early one-shot read returns optedIn:false, and a change
    // listener attached then is bound to a throwaway object that never emits.
    //
    // Instead, wait for init to settle (or fail), then poll the live singleton
    // (window.OneSignal.User.PushSubscription always points at the current
    // object) until the subscription is established, and bind the change
    // listener to that settled object for ongoing updates.
    let disposed = false
    let cleanup = null

    const onSubscriptionChange = (event) => setEnabled(event.current.optedIn === true)

    const timeout = setTimeout(() => {
      setAvailable(false)
      setLoading(false)
    }, READY_TIMEOUT_MS)

    oneSignalReady().then((ready) => {
      clearTimeout(timeout)
      if (disposed) return

      const instance = window.OneSignal
      if (!ready || !instance?.User?.PushSubscription) {
        setAvailable(false)
        setLoading(false)
        return
      }

      setAvailable(true)

      let tries = 0

      const poll = setInterval(() => {
        const subscription = instance.User.PushSubscription
        setEnabled(subscription.optedIn === true)
        setLoading(false)

        // Stop once the subscription/user is established or after ~5s.
        const settled = !!subscription.id || !!instance.User.onesignalId
        if (settled || ++tries >= 10) {
          clearInterval(poll)
          subscription.addEventListener('change', onSubscriptionChange)
          cleanup = () => subscription.removeEventListener('change', onSubscriptionChange)
        }
      }, 500)

      cleanup = () => clearInterval(poll)
    })

    return () => {
      disposed = true
      clearTimeout(timeout)
      cleanup?.()
    }
  }, [])

  const state = loading ? 'جاري التحميل...' : !available ? 'غير متاحة' : enabled ? 'مفعلة' : 'غير مفعلة'

  return { enabled, loading, available, state, toggle }
}
