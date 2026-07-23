import 'bootstrap'
import '@/shared/styles/base.scss'
import 'vue-sonner/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'

import App from './App.vue'
import router from './router'
import { runOfflineMigrations } from '@/shared/offline/migrations'

runOfflineMigrations().catch(() => {})

const app = createApp(App)

app.use(createPinia())
app.use(router)

const dev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const appId = dev ? 'b37d0769-5cca-4b84-b073-29a44dbf55c0' : '1f095647-697b-468b-a8ae-f3833bda6869'

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
app.use(OneSignalVuePlugin, {
  appId,
  serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
  serviceWorkerParam: { scope: '/push/onesignal/' },
  allowLocalhostAsSecureOrigin: true,
})

router.isReady().then(() => {
  app.mount('#app')
})
