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
    // Keep only the keys actually present in the query — storing null for the
    // absent ones would overwrite (and so clear) the user's saved colors when
    // the watchEffect merges the overrides in.
    const overrides = {}
    if (modeParam === 'light' || modeParam === 'dark') overrides.mode = modeParam
    if (fg) overrides.fg = fg
    if (bg) overrides.bg = bg

    queryOverrides.value = Object.keys(overrides).length ? overrides : null
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
    applyPrimaryColor(theme.fg)
    applyBgColor(theme.bg)

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
