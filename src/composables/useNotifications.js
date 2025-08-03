import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

/**
 * Composable for handling browser notifications
 * Provides a convenient interface for notification management
 */
export function useNotifications() {
  const notificationStore = useNotificationStore()

  // Check if notifications are supported
  const isSupported = computed(() => notificationStore.isSupported)

  // Permission states
  const permission = computed(() => notificationStore.permission)
  const isGranted = computed(() => notificationStore.isGranted)
  const isDenied = computed(() => notificationStore.isDenied)
  const canRequest = computed(() => notificationStore.canRequest)

  // Settings
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

  /**
   * Request notification permission
   */
  async function requestPermission() {
    const granted = await notificationStore.requestPermission()
    if (granted) {
      // Initialize notifications after permission is granted
      notificationStore.initialize()
    }
    return granted
  }

  /**
   * Show a test notification
   */
  async function showTestNotification(type = 'morning') {
    if (!isGranted.value) {
      console.warn('Notification permission not granted')
      return
    }

    const notifications = {
      morning: {
        title: 'تجربة - أذكار الصباح',
        body: 'هذه رسالة تجريبية لأذكار الصباح',
      },
      evening: {
        title: 'تجربة - أذكار المساء',
        body: 'هذه رسالة تجريبية لأذكار المساء',
      },
    }

    const config = notifications[type] || notifications.morning

    try {
      await notificationStore.showNotification(config.title, {
        body: config.body,
        data: { type: `${type}-azkar-test` },
      })
      console.log(`Test notification sent: ${config.title}`)
    } catch (error) {
      console.error('Failed to show test notification:', error)
    }
  }

  /**
   * Get the next scheduled notification time
   */
  function getNextNotificationTime(type) {
    const timeString = type === 'morning' ? morningTime.value : eveningTime.value
    const enabled = type === 'morning' ? morningEnabled.value : eveningEnabled.value

    if (!enabled) return null

    const [hours, minutes] = timeString.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(hours, minutes, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1)
    }

    return target
  }

  /**
   * Format time until next notification
   */
  function getTimeUntilNext(type) {
    const nextTime = getNextNotificationTime(type)
    if (!nextTime) return null

    const now = new Date()
    const diff = nextTime.getTime() - now.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`
    } else {
      return `${minutes} دقيقة`
    }
  }

  return {
    // Permission states
    isSupported,
    permission,
    isGranted,
    isDenied,
    canRequest,

    // Settings
    morningEnabled,
    morningTime,
    eveningEnabled,
    eveningTime,

    // Actions
    requestPermission,
    showTestNotification,
    getNextNotificationTime,
    getTimeUntilNext,
  }
}
