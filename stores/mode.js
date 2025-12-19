import { defineStore } from 'pinia'

export const useModeStore = defineStore('mode', () => {
  const mode = ref('light')
  const isDark = computed(() => mode.value === 'dark')

  // Initialize from localStorage on client
  if (import.meta.client) {
    mode.value = localStorage.getItem('mode') || 'light'
  }

  function toggle() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
    if (import.meta.client) {
      localStorage.setItem('mode', mode.value)
    }
  }

  watch(mode, (newMode) => {
    if (import.meta.client) {
      document.body.setAttribute('data-bs-theme', newMode)
    }
  }, { immediate: true })

  return { mode, isDark, toggle }
})
