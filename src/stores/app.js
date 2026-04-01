import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  const autoUpdateServiceWorker = useLocalStorage('auto-update-service-worker', true)

  return {
    autoUpdateServiceWorker,
  }
})
