import 'bootstrap/js/dist/dropdown'

// First, so back closes an open sheet before the router hears of it.
import { installSheetHistory } from '@/shared/ui/sheetHistory'
import '@/shared/styles/base.scss'
import 'vue-sonner/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useOneSignal } from '@onesignal/onesignal-vue3'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
installSheetHistory(router)

const dev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const appId = dev ? 'b37d0769-5cca-4b84-b073-29a44dbf55c0' : '1f095647-697b-468b-a8ae-f3833bda6869'

// OneSignal needs its own scope or it will replace the root Workbox worker.
// Keep this path and scope aligned with the OneSignal dashboard's custom worker settings.
const oneSignalOptions = {
  appId,
  serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
  serviceWorkerParam: { scope: '/push/onesignal/' },
  allowLocalhostAsSecureOrigin: true,
}

// Embeds sit inside other sites and never ask for notifications, so they don't load OneSignal at all. Offline its
// script can't load (and logs errors), so it starts once the connection is back. Settings › Notifications waits for
// it through OneSignalDeferred either way.
function initOneSignal() {
  // It rejects in browsers without web push; there is nothing to set up then.
  useOneSignal()
    .init(oneSignalOptions)
    .catch(() => {})
}

if (!window.location.pathname.startsWith('/embed')) {
  if (navigator.onLine) initOneSignal()
  else window.addEventListener('online', initOneSignal, { once: true })
}

router.isReady().then(() => {
  app.mount('#app')
})
