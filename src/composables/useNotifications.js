import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'

/**
 * Composable wrapper around the OneSignal-backed notification store.
 * Provides a convenient interface for the settings UI.
 */
export function useNotifications() {
  const notificationStore = useNotificationStore()

  const {
    isSupported,
    isIos,
    standalone,
    needsInstall,
    permission,
    isGranted,
    isDenied,
    canRequest,
    isSubscribed,
    busy,
  } = storeToRefs(notificationStore)

  // Two-way bindings that re-sync OneSignal tags on every change.
  const morningEnabled = computed({
    get: () => notificationStore.morningEnabled,
    set: (value) => notificationStore.updateMorningSettings(value, notificationStore.morningTime),
  })

  const morningTime = computed({
    get: () => notificationStore.morningTime,
    set: (value) => notificationStore.updateMorningSettings(notificationStore.morningEnabled, value),
  })

  const eveningEnabled = computed({
    get: () => notificationStore.eveningEnabled,
    set: (value) => notificationStore.updateEveningSettings(value, notificationStore.eveningTime),
  })

  const eveningTime = computed({
    get: () => notificationStore.eveningTime,
    set: (value) => notificationStore.updateEveningSettings(notificationStore.eveningEnabled, value),
  })

  function prepare() {
    return notificationStore.prepare()
  }

  function subscribe() {
    return notificationStore.subscribe()
  }

  function showTestNotification(type = 'morning') {
    return notificationStore.showTestNotification(type)
  }

  /** The next time a given reminder will fire (local Date), or null if disabled. */
  function getNextNotificationTime(type) {
    const timeString = type === 'morning' ? morningTime.value : eveningTime.value
    const enabled = type === 'morning' ? morningEnabled.value : eveningEnabled.value
    if (!enabled) return null

    const [hours, minutes] = timeString.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(hours, minutes, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)
    return target
  }

  /** Human-readable time until the next reminder (Arabic), or null if disabled. */
  function getTimeUntilNext(type) {
    const nextTime = getNextNotificationTime(type)
    if (!nextTime) return null

    const diff = nextTime.getTime() - Date.now()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours} ساعة و ${minutes} دقيقة` : `${minutes} دقيقة`
  }

  return {
    // Permission / subscription state
    isSupported,
    isIos,
    standalone,
    needsInstall,
    permission,
    isGranted,
    isDenied,
    canRequest,
    isSubscribed,
    busy,

    // Settings
    morningEnabled,
    morningTime,
    eveningEnabled,
    eveningTime,

    // Actions
    prepare,
    subscribe,
    showTestNotification,
    getNextNotificationTime,
    getTimeUntilNext,
  }
}
