import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import { useOneSignal } from '@onesignal/onesignal-vue3'

export function usePushNotifications() {
  const instance = useOneSignal()

  const enabled = ref(false)
  const loading = ref(true)

  const state = computed(() => {
    if (loading.value) return 'جاري التحميل...'
    return enabled.value ? 'مفعلة' : 'غير مفعلة'
  })

  async function toggle() {
    if (instance.User.PushSubscription.optedIn === true) {
      await instance.User.PushSubscription.optOut()
      toast.success('تم إيقاف الإشعارات')
    } else {
      await instance.Notifications.requestPermission()
      await instance.User.PushSubscription.optIn()
      toast.success('تم تفعيل الإشعارات')
    }

    enabled.value = instance.User.PushSubscription.optedIn === true
  }

  let cleanup = null

  function onSubscriptionChange(event) {
    enabled.value = event.current.optedIn === true
  }

  onMounted(() => {
    // OneSignal replaces PushSubscription during initialization, so poll the live
    // singleton before binding; the initial deferred object never emits changes.
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push((OneSignal) => {
      let tries = 0
      const poll = setInterval(() => {
        const sub = OneSignal.User.PushSubscription
        enabled.value = sub.optedIn === true
        loading.value = false

        const settled = !!sub.id || !!OneSignal.User.onesignalId
        if (settled || ++tries >= 10) {
          clearInterval(poll)
          sub.addEventListener('change', onSubscriptionChange)
          cleanup = () => sub.removeEventListener('change', onSubscriptionChange)
        }
      }, 500)

      cleanup = () => clearInterval(poll)
    })
  })

  onUnmounted(() => {
    if (cleanup) cleanup()
  })

  return { enabled, loading, state, toggle }
}
