import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', () => {
  // Notification permission state
  const permission = ref('default')

  // Notification settings
  const morningEnabled = ref(false)
  const morningTime = ref('06:00')
  const eveningEnabled = ref(false)
  const eveningTime = ref('18:00')

  // Initialize from localStorage on client
  if (import.meta.client) {
    permission.value = typeof Notification !== 'undefined' ? Notification.permission : 'default'
    
    const storedMorningEnabled = localStorage.getItem('notifications.morning.enabled')
    const storedMorningTime = localStorage.getItem('notifications.morning.time')
    const storedEveningEnabled = localStorage.getItem('notifications.evening.enabled')
    const storedEveningTime = localStorage.getItem('notifications.evening.time')
    
    if (storedMorningEnabled) morningEnabled.value = storedMorningEnabled === 'true'
    if (storedMorningTime) morningTime.value = storedMorningTime
    if (storedEveningEnabled) eveningEnabled.value = storedEveningEnabled === 'true'
    if (storedEveningTime) eveningTime.value = storedEveningTime
  }

  // Watch for changes and persist
  watch([morningEnabled, morningTime, eveningEnabled, eveningTime], ([mEnabled, mTime, eEnabled, eTime]) => {
    if (import.meta.client) {
      localStorage.setItem('notifications.morning.enabled', mEnabled.toString())
      localStorage.setItem('notifications.morning.time', mTime)
      localStorage.setItem('notifications.evening.enabled', eEnabled.toString())
      localStorage.setItem('notifications.evening.time', eTime)
    }
  })

  // Computed properties
  const isSupported = computed(() => {
    if (!import.meta.client) return false
    
    if ('Notification' in window) {
      return true
    }

    if ('serviceWorker' in navigator) {
      return 'showNotification' in ServiceWorkerRegistration.prototype
    }

    return false
  })

  const isGranted = computed(() => permission.value === 'granted')
  const isDenied = computed(() => permission.value === 'denied')
  const canRequest = computed(() => permission.value === 'default')

  // Active notification intervals
  const notificationIntervals = ref(new Map())

  /**
   * Request notification permission from the user
   */
  async function requestPermission() {
    if (!import.meta.client || !isSupported.value) {
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
   * Show a notification using the best available method
   */
  async function showNotification(title, options = {}) {
    if (!import.meta.client || !isGranted.value) {
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

    const notificationOptions = { ...defaultOptions, ...options }

    try {
      // Check if we're in a PWA context and have a service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        if (registration && registration.showNotification) {
          return await registration.showNotification(title, notificationOptions)
        }
      }
    } catch (error) {
      console.warn('Failed to show notification via service worker, falling back to basic notifications:', error)
    }

    // Fallback to basic notifications
    try {
      const notification = new Notification(title, notificationOptions)

      setTimeout(() => {
        if (notification && typeof notification.close === 'function') {
          notification.close()
        }
      }, 10000)

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  /**
   * Schedule azkar notifications
   */
  function scheduleAzkarNotifications() {
    if (!import.meta.client) return
    
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

      const timeoutId = setTimeout(async () => {
        try {
          await showNotification(notificationOptions.title, {
            body: notificationOptions.body,
            data: notificationOptions.data,
          })
        } catch (error) {
          console.error('Failed to show scheduled notification:', error)
        }

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
