export default defineNuxtPlugin(() => {
  const modeStore = useModeStore()
  
  // Initialize the mode on client
  if (import.meta.client) {
    const storedMode = localStorage.getItem('mode') || 'light'
    modeStore.mode = storedMode
    document.body.setAttribute('data-bs-theme', storedMode)
  }
})

