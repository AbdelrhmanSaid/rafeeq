import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import * as oneSignal from '@/services/onesignal'

const TEST_ICON = '/icons/android/android-launchericon-192-192.png'

export const useNotificationStore = defineStore('notifications', () => {
  // User-facing reminder settings (persisted locally for the UI).
  const morningEnabled = useLocalStorage('notifications.morning.enabled', false)
  const morningTime = useLocalStorage('notifications.morning.time', '06:00')
  const eveningEnabled = useLocalStorage('notifications.evening.enabled', false)
  const eveningTime = useLocalStorage('notifications.evening.time', '18:00')

  // Sticky flag so returning subscribers re-init OneSignal on startup (to keep
  // tags fresh across DST / travel) while non-subscribers never load the SDK.
  const subscribedBefore = useLocalStorage('notifications.subscribed', false)

  // Reactive push state mirrored from OneSignal.
  const isSupported = ref(oneSignal.isPushSupported())
  const isIos = ref(oneSignal.isIos())
  const standalone = ref(oneSignal.isStandalone())
  const permission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  const optedIn = ref(false)
  const ready = ref(false)
  const busy = ref(false)

  const isGranted = computed(() => permission.value === 'granted')
  const isDenied = computed(() => permission.value === 'denied')
  const canRequest = computed(() => permission.value === 'default')
  const isSubscribed = computed(() => isGranted.value && optedIn.value)
  // On iOS, push only works once the PWA is installed to the Home Screen.
  const needsInstall = computed(() => isIos.value && !standalone.value)

  /**
   * Convert a local "HH:MM" time to a UTC 15-minute bucket "HHMM".
   * Uses the current offset, so DST is correct as of the last sync.
   */
  function toUtcBucket(localTime) {
    const [hours, minutes] = localTime.split(':').map(Number)
    const rounded = Math.round((hours * 60 + minutes) / 15) * 15
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setMinutes(rounded)
    const uh = String(date.getUTCHours()).padStart(2, '0')
    const um = String(date.getUTCMinutes()).padStart(2, '0')
    return `${uh}${um}`
  }

  /** Push the current reminder times to OneSignal as tags (no-op until opted in). */
  async function syncTags() {
    if (!optedIn.value) return
    await oneSignal.setTags({
      azkar_morning: morningEnabled.value ? toUtcBucket(morningTime.value) : '',
      azkar_evening: eveningEnabled.value ? toUtcBucket(eveningTime.value) : '',
    })
  }

  /** Refresh permission + opt-in state from the SDK. */
  async function refreshState() {
    permission.value = await oneSignal.getPermission()
    optedIn.value = await oneSignal.getOptedIn()
    subscribedBefore.value = isSubscribed.value
  }

  /** Lazily load + init OneSignal, wire change listeners, and refresh state. */
  async function ensureReady() {
    if (ready.value) {
      standalone.value = oneSignal.isStandalone()
      return
    }
    await oneSignal.init()
    oneSignal.onPermissionChange((value) => {
      permission.value = value
    })
    oneSignal.onSubscriptionChange((value) => {
      optedIn.value = value
      subscribedBefore.value = isSubscribed.value
    })
    await refreshState()
    standalone.value = oneSignal.isStandalone()
    ready.value = true
    await syncTags()
  }

  /**
   * Request permission and opt in. Must be called from a user gesture.
   * Returns whether the device ended up subscribed.
   */
  async function subscribe() {
    if (!isSupported.value || busy.value) return false
    busy.value = true
    try {
      await ensureReady()
      await oneSignal.subscribe()
      await refreshState()
      if (isSubscribed.value) await syncTags()
      return isSubscribed.value
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error)
      return false
    } finally {
      busy.value = false
    }
  }

  async function updateMorningSettings(enabled, time) {
    morningEnabled.value = enabled
    morningTime.value = time
    await syncTags()
  }

  async function updateEveningSettings(enabled, time) {
    eveningEnabled.value = enabled
    eveningTime.value = time
    await syncTags()
  }

  /**
   * Show an immediate LOCAL notification as a preview ("test"). Real scheduled
   * reminders are delivered by OneSignal; this only confirms the device can
   * display notifications.
   */
  async function showTestNotification(type = 'morning') {
    if (!isGranted.value) return

    const presets = {
      morning: { title: '✨ أذكار الصباح ✨', body: 'هذه رسالة تجريبية لأذكار الصباح', url: '/azkar/morning' },
      evening: { title: '✨ أذكار المساء ✨', body: 'هذه رسالة تجريبية لأذكار المساء', url: '/azkar/evening' },
    }
    const config = presets[type] || presets.morning

    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 3000)),
      ])
      await registration.showNotification(config.title, {
        body: config.body,
        icon: TEST_ICON,
        badge: TEST_ICON,
        tag: `azkar-test-${type}`,
        data: { url: config.url },
      })
    } catch {
      // Fall back to a plain Notification (e.g. when no SW is active in dev).
      try {
        new Notification(config.title, { body: config.body, icon: TEST_ICON })
      } catch (error) {
        console.error('Failed to show test notification:', error)
      }
    }
  }

  /** Called once on app startup. Stays lightweight for non-subscribers. */
  function initialize() {
    if (typeof Notification !== 'undefined') permission.value = Notification.permission
    if (subscribedBefore.value && isSupported.value) {
      // Returning subscriber: re-init in the background to refresh tags.
      ensureReady().catch((error) => console.error('OneSignal init failed:', error))
    }
  }

  return {
    // State
    morningEnabled,
    morningTime,
    eveningEnabled,
    eveningTime,
    permission,
    optedIn,
    busy,

    // Computed
    isSupported,
    isIos,
    standalone,
    needsInstall,
    isGranted,
    isDenied,
    canRequest,
    isSubscribed,

    // Actions
    prepare: ensureReady,
    subscribe,
    showTestNotification,
    updateMorningSettings,
    updateEveningSettings,
    initialize,
  }
})
