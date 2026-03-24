import { defineStore } from 'pinia'
import { computed, nextTick, watchEffect } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { applyPrimaryColor, applyBgColor, applyMode, syncMetaThemeColor } from '@/utilities/css'

export const useThemeStore = defineStore('theme', () => {
  const mode = useLocalStorage('mode', 'system')
  const primaryColor = useLocalStorage('theme-primary', '')
  const prefersDark = usePreferredDark()

  const resolvedMode = computed(() => {
    if (mode.value === 'system') return prefersDark.value ? 'dark' : 'light'
    return mode.value
  })

  const isDark = computed(() => resolvedMode.value === 'dark')

  function setMode(next) {
    if (['light', 'dark', 'system'].includes(next)) {
      mode.value = next
    }
  }

  function toggle() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  function setPrimaryColor(color) {
    primaryColor.value = color || ''
  }

  function applyQueryOverrides({ mode: modeParam, fg, bg }) {
    if (modeParam === 'light' || modeParam === 'dark') applyMode(modeParam)
    if (fg) applyPrimaryColor(fg)
    if (bg) applyBgColor(bg)
  }

  watchEffect(() => {
    applyMode(resolvedMode.value)
  })

  watchEffect(() => {
    applyPrimaryColor(primaryColor.value || null)
  })

  watchEffect(() => {
    void resolvedMode.value
    void primaryColor.value
    nextTick(syncMetaThemeColor)
  })

  return {
    mode,
    primaryColor,
    isDark,
    setMode,
    toggle,
    setPrimaryColor,
    applyQueryOverrides,
  }
})
