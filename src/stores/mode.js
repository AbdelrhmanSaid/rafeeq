import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'

export const useModeStore = defineStore('mode', () => {
  const mode = ref(localStorage.getItem('mode') || 'light')
  const isDark = computed(() => mode.value === 'dark')

  function setMode(nextMode) {
    if (!['light', 'dark'].includes(nextMode)) return
    mode.value = nextMode
    localStorage.setItem('mode', mode.value)
  }

  function toggle() {
    setMode(mode.value === 'light' ? 'dark' : 'light')
  }

  watchEffect(() => {
    document.body.setAttribute('data-bs-theme', mode.value)
  })

  return { mode, isDark, setMode, toggle }
})
