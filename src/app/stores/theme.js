import { defineStore } from 'pinia'
import { computed, nextTick, watchEffect } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import {
  applyPrimaryColor,
  applyBgColor,
  applyMode,
  applyFontScale,
  clampFontScale,
  syncMetaThemeColor,
  DEFAULT_FONT_SCALE,
} from '@/shared/utils/css'

export const useThemeStore = defineStore('theme', () => {
  const mode = useLocalStorage('mode', 'system')
  const primaryColor = useLocalStorage('theme-primary', '')
  const fontScale = useLocalStorage('font-scale', DEFAULT_FONT_SCALE)
  const prefersDark = usePreferredDark()

  const resolvedMode = computed(() => {
    if (mode.value === 'system') return prefersDark.value ? 'dark' : 'light'
    return mode.value
  })

  function setMode(next) {
    if (['light', 'dark', 'system'].includes(next)) {
      mode.value = next
    }
  }

  function setPrimaryColor(color) {
    primaryColor.value = color || ''
  }

  function setFontScale(next) {
    fontScale.value = clampFontScale(next)
  }

  function resetFontScale() {
    fontScale.value = DEFAULT_FONT_SCALE
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
    applyFontScale(fontScale.value)
  })

  watchEffect(() => {
    void resolvedMode.value
    void primaryColor.value
    nextTick(syncMetaThemeColor)
  })

  return {
    mode,
    primaryColor,
    fontScale,
    setMode,
    setPrimaryColor,
    setFontScale,
    resetFontScale,
    applyQueryOverrides,
  }
})
