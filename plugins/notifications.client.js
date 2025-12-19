export default defineNuxtPlugin(() => {
  const notificationStore = useNotificationStore()
  
  // Initialize notifications on client
  if (import.meta.client) {
    notificationStore.initialize()
  }
})

