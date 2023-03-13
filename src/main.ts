import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'

import '@/assets/scss/style.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)

router.isReady().then(() => app.mount('#app'))
