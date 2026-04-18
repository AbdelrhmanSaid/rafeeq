import { defineStore } from 'pinia'
import { computed, nextTick, watchEffect } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { applyPrimaryColor, applyBgColor, applyMode, syncMetaThemeColor } from '@/utilities/css'

const DEFAULT_FONT_SIZE = 16
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 24

export const useThemeStore = defineStore('theme', () => {
  const mode = useLocalStorage('mode', 'system')
  const primaryColor = useLocalStorage('theme-primary', '')
  const fontSize = useLocalStorage('app-font-size', DEFAULT_FONT_SIZE)
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

  function setFontSize(size) {
    const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Number(size) || DEFAULT_FONT_SIZE))
    fontSize.value = clamped
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
    document.documentElement.style.setProperty('--app-font-size', `${fontSize.value}px`)

    void resolvedMode.value
    void primaryColor.value
    nextTick(syncMetaThemeColor)
  })

  return {
    mode,
    primaryColor,
    fontSize,
    isDark,
    setMode,
    toggle,
    setPrimaryColor,
    setFontSize,
    applyQueryOverrides,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
    DEFAULT_FONT_SIZE,
  }
})
