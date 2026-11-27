import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOnline } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { useOneSignal } from '@onesignal/onesignal-vue3'

const BLOCKED_MESSAGE = 'الإشعارات محظورة في المتصفح، اسمح بها لهذا الموقع من إعدادات المتصفح ثم حاول مجددًا'

const browserPermission = () => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)

export function usePushNotifications() {
  const instance = useOneSignal()
  const online = useOnline()

  const enabled = ref(false)
  const loading = ref(true)
  const busy = ref(false)
  const permission = ref(browserPermission())
  const supported = instance.Notifications.isPushSupported() && permission.value !== 'unsupported'

  const blocked = computed(() => permission.value === 'denied')

  const unavailableReason = computed(() => {
    if (!supported) return 'هذا المتصفح لا يدعم الإشعارات'
    if (blocked.value) return BLOCKED_MESSAGE
    // OneSignal loads only online (see main.js), so offline it may not be there yet.
    if (loading.value && !online.value) return 'يتطلب اتصالاً بالإنترنت'
    return null
  })

  const disabled = computed(() => !supported || blocked.value || loading.value || busy.value)

  // Success is reported only once the subscription says so: a blocked or dismissed prompt changes nothing.
  async function toggle() {
    if (disabled.value) return
    busy.value = true

    try {
      if (instance.User.PushSubscription.optedIn === true) {
        await instance.User.PushSubscription.optOut()
        if (instance.User.PushSubscription.optedIn !== true) toast.success('تم إيقاف الإشعارات')
      } else {
        await instance.Notifications.requestPermission()
        permission.value = browserPermission()

        if (permission.value === 'denied') {
          toast.error(BLOCKED_MESSAGE)
        } else if (permission.value === 'granted') {
          await instance.User.PushSubscription.optIn()
          if (instance.User.PushSubscription.optedIn === true) toast.success('تم تفعيل الإشعارات')
          else toast.error('تعذر تفعيل الإشعارات، حاول مجددًا')
        }
      }
    } catch {
      toast.error('تعذر تغيير إعداد الإشعارات، حاول مجددًا')
    } finally {
      enabled.value = instance.User.PushSubscription.optedIn === true
      busy.value = false
    }
  }

  let cleanup = null
  let permissionStatus = null

  function onSubscriptionChange(event) {
    enabled.value = event.current.optedIn === true
  }

  // Allowing or blocking from the browser's own settings shows here without a reload.
  function onPermissionChange() {
    permission.value = browserPermission()
  }

  onMounted(() => {
    navigator.permissions
      ?.query({ name: 'notifications' })
      .then((status) => {
        permissionStatus = status
        status.addEventListener('change', onPermissionChange)
      })
      .catch(() => {})

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
    permissionStatus?.removeEventListener('change', onPermissionChange)
  })

  return { enabled, disabled, unavailableReason, toggle }
}
