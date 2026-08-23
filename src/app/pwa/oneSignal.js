import OneSignal from 'react-onesignal'

const DEV_APP_ID = 'b37d0769-5cca-4b84-b073-29a44dbf55c0'
const PROD_APP_ID = '1f095647-697b-468b-a8ae-f3833bda6869'

const isDevHost = () => ['localhost', '127.0.0.1'].includes(window.location.hostname)

// OneSignal must NOT share the root scope ('/') with the Workbox/PWA service
// worker — only one worker can own a scope, so two at '/' clobber each other on
// every load, which makes the PWA detect a "new" worker and reload the app a
// second or two after it opens. We scope OneSignal to '/push/onesignal/' so the
// PWA keeps '/'.
//
// IMPORTANT: this scope is only honored if the OneSignal dashboard has
// "Customize service worker paths and filenames" enabled (Advanced Push
// Settings) with the path/scope below. The worker file must live at
// public/push/onesignal/OneSignalSDKWorker.js to match. If the dashboard is not
// configured to match, push notifications break.
export function initOneSignal() {
  return OneSignal.init({
    appId: isDevHost() ? DEV_APP_ID : PROD_APP_ID,
    serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
    serviceWorkerParam: { scope: '/push/onesignal/' },
    allowLocalhostAsSecureOrigin: true,
  }).catch((error) => console.error('OneSignal init failed:', error))
}
