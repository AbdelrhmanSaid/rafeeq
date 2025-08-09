import 'bootstrap'
import './assets/scss/base.scss'
import 'vue-sonner/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useNotificationStore } from './stores/notifications'

const app = createApp(App)

app.use(createPinia())
app.use(router)

router.isReady().then(() => {
  app.mount('#app')

  // Initialize notifications after app is mounted
  const notificationStore = useNotificationStore()
  notificationStore.initialize()
})
