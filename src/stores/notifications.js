import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export const useNotificationStore = defineStore('notifications', () => {
  // Notification permission state
  const permission = ref(Notification.permission)

  // Notification settings stored in localStorage
  const morningEnabled = useLocalStorage('notifications.morning.enabled', false)
  const morningTime = useLocalStorage('notifications.morning.time', '06:00')
  const eveningEnabled = useLocalStorage('notifications.evening.enabled', false)
  const eveningTime = useLocalStorage('notifications.evening.time', '18:00')

  // Computed properties
  const isSupported = computed(() => 'Notification' in window)
  const isGranted = computed(() => permission.value === 'granted')
  const isDenied = computed(() => permission.value === 'denied')
  const canRequest = computed(() => permission.value === 'default')

  // Active notification intervals
  const notificationIntervals = ref(new Map())

  /**
   * Request notification permission from the user
   */
  async function requestPermission() {
    if (!isSupported.value) {
      console.warn('Notifications are not supported in this browser')
      return false
    }

    if (isGranted.value) {
      return true
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  /**
   * Show a notification
   */
  function showNotification(title, options = {}) {
    if (!isGranted.value) {
      console.warn('Notification permission not granted')
      return
    }

    const defaultOptions = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'azkar-reminder',
      renotify: true,
      requireInteraction: false,
      silent: false,
    }

    const notification = new Notification(title, { ...defaultOptions, ...options })

    // Auto-close notification after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  }

  /**
   * Schedule azkar notifications
   */
  function scheduleAzkarNotifications() {
    // Clear existing intervals
    clearAllNotifications()

    if (morningEnabled.value && isGranted.value) {
      scheduleDailyNotification('morning', morningTime.value, {
        title: '✨ اذكار الصباح ✨',
        body: 'من فوائد قراءة أذكار الصباح دوام الصلة بالله تعالى والأنس به وبمعيّته، وتحصيل كرامة ثناءه في الملأ الأعلى، ورفعة الدرجات في الجنة.',
        data: { type: 'morning-azkar', categoryId: 1 },
      })
    }

    if (eveningEnabled.value && isGranted.value) {
      scheduleDailyNotification('evening', eveningTime.value, {
        title: '✨ اذكار المساء ✨',
        body: 'عن أبي موسى الأشعري رضي الله عنه أن رسول الله صلى الله عليه وسلم، قال: (مثل الذي يذكر ربه والذي لا يذكر ربه، مثل الحيِّ والميت) متفق عليه.',
        data: { type: 'evening-azkar', categoryId: 2 },
      })
    }
  }

  /**
   * Schedule a daily notification at a specific time
   */
  function scheduleDailyNotification(id, timeString, notificationOptions) {
    const [hours, minutes] = timeString.split(':').map(Number)

    function scheduleNext() {
      const now = new Date()
      const targetTime = new Date()
      targetTime.setHours(hours, minutes, 0, 0)

      // If the time has passed today, schedule for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1)
      }

      const timeUntilNotification = targetTime.getTime() - now.getTime()

      const timeoutId = setTimeout(() => {
        showNotification(notificationOptions.title, {
          body: notificationOptions.body,
          data: notificationOptions.data,
        })

        // Schedule the next notification (24 hours later)
        scheduleNext()
      }, timeUntilNotification)

      notificationIntervals.value.set(id, timeoutId)
    }

    scheduleNext()
  }

  /**
   * Clear all scheduled notifications
   */
  function clearAllNotifications() {
    for (const [id, timeoutId] of notificationIntervals.value) {
      clearTimeout(timeoutId)
    }
    notificationIntervals.value.clear()
  }

  /**
   * Update morning notification settings
   */
  function updateMorningSettings(enabled, time) {
    morningEnabled.value = enabled
    morningTime.value = time
    scheduleAzkarNotifications()
  }

  /**
   * Update evening notification settings
   */
  function updateEveningSettings(enabled, time) {
    eveningEnabled.value = enabled
    eveningTime.value = time
    scheduleAzkarNotifications()
  }

  /**
   * Initialize notifications (call this when the app starts)
   */
  function initialize() {
    if (isGranted.value) {
      scheduleAzkarNotifications()
    }
  }

  return {
    // State
    permission,
    morningEnabled,
    morningTime,
    eveningEnabled,
    eveningTime,

    // Computed
    isSupported,
    isGranted,
    isDenied,
    canRequest,

    // Actions
    requestPermission,
    showNotification,
    scheduleAzkarNotifications,
    clearAllNotifications,
    updateMorningSettings,
    updateEveningSettings,
    initialize,
  }
})
