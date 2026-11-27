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

// Own scope so it doesn't replace the root Workbox worker; must match the OneSignal dashboard's worker settings.
const oneSignalOptions = {
  appId,
  serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
  serviceWorkerParam: { scope: '/push/onesignal/' },
  allowLocalhostAsSecureOrigin: true,
}

// Offline the script can't load, so it waits for the connection.
function initOneSignal() {
  // Rejects in browsers without web push.
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
