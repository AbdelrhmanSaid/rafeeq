import { defineStore } from 'pinia'
import { computed, nextTick, ref, watchEffect } from 'vue'
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
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

export const useThemeStore = defineStore('theme', () => {
  const mode = useLocalStorage(STORAGE_KEYS.themeMode, 'system')
  const primaryColor = useLocalStorage(STORAGE_KEYS.themePrimary, '')
  const fontScale = useLocalStorage(STORAGE_KEYS.fontScale, DEFAULT_FONT_SCALE)
  const prefersDark = usePreferredDark()

  // Embed query params (mode/fg/bg) that must survive watchEffect re-runs.
  const queryOverrides = ref(null)

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

  function applyQueryOverrides({ mode: modeParam, fg, bg } = {}) {
    const nextMode = modeParam === 'light' || modeParam === 'dark' ? modeParam : null
    const nextFg = fg || null
    const nextBg = bg || null

    if (nextMode || nextFg || nextBg) {
      queryOverrides.value = { mode: nextMode, fg: nextFg, bg: nextBg }
    } else {
      queryOverrides.value = null
    }
  }

  function clearQueryOverrides() {
    queryOverrides.value = null
  }

  watchEffect(() => {
    const theme = {
      mode: resolvedMode.value,
      fg: primaryColor.value || null,
      bg: null,
    }

    if (queryOverrides.value) {
      Object.assign(theme, queryOverrides.value)
    }

    if (theme.mode) applyMode(theme.mode)
    if (theme.fg) applyPrimaryColor(theme.fg)
    if (theme.bg) applyBgColor(theme.bg)

    nextTick(syncMetaThemeColor)
  })

  watchEffect(() => {
    applyFontScale(fontScale.value)
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
    clearQueryOverrides,
  }
})
