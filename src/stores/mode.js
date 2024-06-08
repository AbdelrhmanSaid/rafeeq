import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'

export const useModeStore = defineStore('mode', () => {
  const mode = ref(localStorage.getItem('mode') || 'light')
  const isDark = computed(() => mode.value === 'dark')

  function toggle() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('mode', mode.value)
  }

  watchEffect(() => {
    document.body.setAttribute('data-bs-theme', mode.value)
  })

  return { mode, isDark, toggle }
})
