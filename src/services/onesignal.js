/**
 * OneSignal Web Push integration (SDK v16).
 *
 * Design notes:
 * - The SDK is loaded LAZILY (only when the user actually engages notifications),
 *   so visitors who never touch notifications never contact OneSignal.
 * - OneSignal runs in its OWN service worker at the sub-scope `/push/onesignal/`
 *   so it never collides with the app's Workbox service worker at `/sw.js`.
 *   (Two service workers cannot control the same scope.)
 * - Actual scheduled delivery is triggered by the Netlify scheduled function
 *   `netlify/functions/send-azkar-reminders.mjs`, which targets users by the
 *   `azkar_morning` / `azkar_evening` tags this module sets.
 */

const APP_ID = '1f095647-697b-468b-a8ae-f3833bda6869'
const SDK_URL = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'

let sdkPromise = null
let initPromise = null

/** Inject the OneSignal page SDK <script> once. */
function loadSdk() {
  if (sdkPromise) return sdkPromise
  window.OneSignalDeferred = window.OneSignalDeferred || []
  sdkPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${SDK_URL}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = SDK_URL
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      sdkPromise = null
      reject(new Error('Failed to load OneSignal SDK'))
    }
    document.head.appendChild(script)
  })
  return sdkPromise
}

/**
 * Queue a function onto the OneSignal deferred queue and resolve with its result.
 * Callbacks run in order, only after the SDK has loaded and OneSignal is ready.
 */
function run(fn) {
  window.OneSignalDeferred = window.OneSignalDeferred || []
  return new Promise((resolve, reject) => {
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        resolve(await fn(OneSignal))
      } catch (error) {
        reject(error)
      }
    })
  })
}

/** Browser supports the APIs web push needs. */
export function isPushSupported() {
  return (
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  )
}

/** Running as an installed/standalone PWA (required for push on iOS). */
export function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

/** Best-effort iOS / iPadOS detection. */
export function isIos() {
  const ua = navigator.userAgent || ''
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** Load the SDK and initialise OneSignal exactly once. */
export function init() {
  if (initPromise) return initPromise
  initPromise = loadSdk()
    .then(() =>
      run((OneSignal) =>
        OneSignal.init({
          appId: APP_ID,
          serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/push/onesignal/' },
          allowLocalhostAsSecureOrigin: true,
        }),
      ),
    )
    .catch((error) => {
      initPromise = null
      throw error
    })
  return initPromise
}

/** Native permission state: 'default' | 'granted' | 'denied'. */
export function getPermission() {
  return run((OneSignal) => {
    const native = OneSignal.Notifications.permissionNative
    if (native) return native
    return OneSignal.Notifications.permission ? 'granted' : 'default'
  })
}

/** Whether this device is currently opted in to push. */
export function getOptedIn() {
  return run((OneSignal) => !!OneSignal.User?.PushSubscription?.optedIn)
}

/**
 * Prompt for permission (must be called from a user gesture) and opt in.
 * Returns the resulting opted-in state.
 */
export function subscribe() {
  return run(async (OneSignal) => {
    await OneSignal.Notifications.requestPermission()
    if (OneSignal.Notifications.permission && !OneSignal.User.PushSubscription.optedIn) {
      await OneSignal.User.PushSubscription.optIn()
    }
    return !!OneSignal.User.PushSubscription.optedIn
  })
}

export function onPermissionChange(callback) {
  run((OneSignal) =>
    OneSignal.Notifications.addEventListener('permissionChange', () => {
      const native = OneSignal.Notifications.permissionNative
      callback(native || (OneSignal.Notifications.permission ? 'granted' : 'default'))
    }),
  )
}

export function onSubscriptionChange(callback) {
  run((OneSignal) =>
    OneSignal.User.PushSubscription.addEventListener('change', (event) => {
      callback(!!event?.current?.optedIn)
    }),
  )
}

/**
 * Sync reminder tags. Pass a string value to set a tag, or '' / null to remove it.
 * e.g. setTags({ azkar_morning: '0230', azkar_evening: '' })
 */
export function setTags(tags) {
  return run((OneSignal) => {
    const toAdd = {}
    const toRemove = []
    for (const [key, value] of Object.entries(tags)) {
      if (value === '' || value == null) toRemove.push(key)
      else toAdd[key] = String(value)
    }
    if (Object.keys(toAdd).length) OneSignal.User.addTags(toAdd)
    toRemove.forEach((key) => OneSignal.User.removeTag(key))
  })
}
