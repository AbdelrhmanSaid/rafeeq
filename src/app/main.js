import 'bootstrap'
import '@/shared/styles/base.scss'
import 'vue-sonner/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const dev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const appId = dev ? 'b37d0769-5cca-4b84-b073-29a44dbf55c0' : '1f095647-697b-468b-a8ae-f3833bda6869'

app.use(OneSignalVuePlugin, {
  appId,
  serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
  serviceWorkerParam: { scope: '/push/onesignal/' },
  allowLocalhostAsSecureOrigin: true,
})

router.isReady().then(() => {
  app.mount('#app')
})
