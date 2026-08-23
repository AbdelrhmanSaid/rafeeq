import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import OneSignal from 'react-onesignal'

// Wraps the OneSignal push-subscription lifecycle for this device.
export function usePushNotifications() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const toggle = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    // The OneSignal SDK loads and initializes asynchronously. During init the
    // User.PushSubscription namespace is reconstructed (and the subscription is
    // re-established via auto-resubscribe) AFTER the first OneSignalDeferred
    // callback runs. So an early one-shot read returns optedIn:false, and a change
    // listener attached then is bound to a throwaway object that never emits.
    //
    // Instead, poll the live singleton (window.OneSignal.User.PushSubscription
    // always points at the current object) until init settles, then bind the
    // change listener to that settled object for ongoing updates.
    let cleanup = null

    const onSubscriptionChange = (event) => setEnabled(event.current.optedIn === true)

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push((instance) => {
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

    return () => cleanup?.()
  }, [])

  const state = loading ? 'جاري التحميل...' : enabled ? 'مفعلة' : 'غير مفعلة'

  return { enabled, loading, state, toggle }
}
