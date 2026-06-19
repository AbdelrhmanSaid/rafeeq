import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const DEFAULT_NOTIFICATION_TOPICS = [
  'morning-azkar',
  'evening-azkar',
  'monday-fast',
  'thursday-fast',
  'white-days-fast',
  'friday-kahf',
]

export const useAppStore = defineStore('app', () => {
  const autoUpdateServiceWorker = useLocalStorage('auto-update-service-worker', true)
  const zekrVibrationEnabled = useLocalStorage('zekr-vibration-enabled', true)
  const zekrVibrationIntensity = useLocalStorage('zekr-vibration-intensity', 60)
  const zekrMoveNextOnComplete = useLocalStorage('zekr-move-next-on-complete', false)
  const notificationTimezone = useLocalStorage(
    'notification-timezone',
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  )
  const notificationTopics = useLocalStorage('notification-topics', DEFAULT_NOTIFICATION_TOPICS)
  const notificationTopicsDefaulted = useLocalStorage('notification-topics-defaulted', false)

  if (!Number.isFinite(zekrVibrationIntensity.value)) {
    zekrVibrationIntensity.value = 20
  }

  if (!notificationTopicsDefaulted.value) {
    if (notificationTopics.value.length === 0) {
      notificationTopics.value = DEFAULT_NOTIFICATION_TOPICS
    }
    notificationTopicsDefaulted.value = true
  }

  function syncNotificationTimezone() {
    notificationTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  }

  function toggleNotificationTopic(topic) {
    notificationTopics.value = notificationTopics.value.includes(topic)
      ? notificationTopics.value.filter((item) => item !== topic)
      : [...notificationTopics.value, topic]
  }

  return {
    autoUpdateServiceWorker,
    zekrVibrationEnabled,
    zekrVibrationIntensity,
    zekrMoveNextOnComplete,
    notificationTimezone,
    notificationTopics,
    syncNotificationTimezone,
    toggleNotificationTopic,
  }
})
