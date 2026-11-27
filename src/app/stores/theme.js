import { defineStore } from 'pinia'
import { computed, nextTick, ref, watchEffect } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import {
  applyPrimaryColor,
  applyBgColor,
  applyMode,
  applyPaper,
  applyFontScale,
  clampFontScale,
  syncMetaThemeColor,
  DEFAULT_FONT_SCALE,
} from '@/shared/utils/css'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { SYSTEM_THEME, paperOf, themeOf } from '@/shared/constants/themes'

export const useThemeStore = defineStore('theme', () => {
  // Holds a look from THEMES; 'light', 'dark' and 'system' are the values saved before yellow and black.
  const mode = useLocalStorage(STORAGE_KEYS.themeMode, SYSTEM_THEME)
  const primaryColor = useLocalStorage(STORAGE_KEYS.themePrimary, '')
  const fontScale = useLocalStorage(STORAGE_KEYS.fontScale, DEFAULT_FONT_SCALE)
  const prefersDark = usePreferredDark()

  const queryOverrides = ref(null)
  // A screen's own look, like the Quran reader's background; it goes when the screen does.
  const pageTheme = ref(null)

  const resolvedTheme = computed(() => {
    if (themeOf(pageTheme.value)?.scheme) return pageTheme.value
    // An unknown saved value, from an edited backup, follows the phone.
    if (themeOf(mode.value)?.scheme) return mode.value
    return prefersDark.value ? 'dark' : 'light'
  })

  function setMode(next) {
    if (themeOf(next)) mode.value = next
  }

  function setPageTheme(next) {
    pageTheme.value = themeOf(next)?.scheme ? next : null
  }

  function clearPageTheme() {
    pageTheme.value = null
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
    // Omitted query keys must not clear saved colors when overrides are merged.
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
      mode: themeOf(resolvedTheme.value).scheme,
      paper: paperOf(resolvedTheme.value),
      fg: primaryColor.value || null,
      bg: null,
    }

    // An embed's query wins: the host page asks for a plain scheme, or an exact background.
    if (queryOverrides.value) {
      Object.assign(theme, queryOverrides.value)
      if (queryOverrides.value.mode || queryOverrides.value.bg) theme.paper = null
    }

    if (theme.mode) applyMode(theme.mode)
    applyPaper(theme.paper)
    applyPrimaryColor(theme.fg)
    applyBgColor(theme.bg)

    // Read here, not in the callback, so a change of the phone's theme re-syncs the bar even with a manual app theme.
    const systemMode = prefersDark.value ? 'dark' : 'light'
    nextTick(() => syncMetaThemeColor({ systemMode }))
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
    setPageTheme,
    clearPageTheme,
  }
})
