import { useLayoutEffect } from 'react'
import { create } from 'zustand'
import { persistFields } from '@/shared/lib/persist'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { isEmbedPath } from '@/app/router/routes'
import {
  applyPrimaryColor,
  applyBgColor,
  applyMode,
  applyFontScale,
  clampFontScale,
  syncMetaThemeColor,
  DEFAULT_FONT_SCALE,
} from '@/shared/utils/css'

const MODES = ['light', 'dark', 'system']

const parseQueryOverrides = ({ mode, fg, bg } = {}) => {
  const nextMode = mode === 'light' || mode === 'dark' ? mode : null
  return nextMode || fg || bg ? { mode: nextMode, fg: fg || null, bg: bg || null } : null
}

// Read the embed overrides from the URL the app was opened with, so an embed
// paints with its requested theme from the first frame instead of flashing
// the stored theme until the router's effects catch up.
function initialQueryOverrides() {
  if (typeof window === 'undefined') return null

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const pathname = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length) || '/'
    : window.location.pathname

  if (!isEmbedPath(pathname)) return null

  return parseQueryOverrides(Object.fromEntries(new URLSearchParams(window.location.search)))
}

export const useThemeStore = create(
  persistFields({
    mode: STORAGE_KEYS.themeMode,
    primaryColor: STORAGE_KEYS.themePrimary,
    fontScale: STORAGE_KEYS.fontScale,
  })((set) => ({
    mode: 'system',
    primaryColor: '',
    fontScale: DEFAULT_FONT_SCALE,

    // Embed query params (mode/fg/bg), which override the stored theme for as
    // long as an embed route is open.
    queryOverrides: initialQueryOverrides(),

    setMode: (mode) => {
      if (MODES.includes(mode)) set({ mode })
    },
    setPrimaryColor: (color) => set({ primaryColor: color || '' }),
    setFontScale: (scale) => set({ fontScale: clampFontScale(scale) }),
    resetFontScale: () => set({ fontScale: DEFAULT_FONT_SCALE }),

    applyQueryOverrides: (query) => set({ queryOverrides: parseQueryOverrides(query) }),
    clearQueryOverrides: () => set({ queryOverrides: null }),
  })),
)

// The concrete mode in effect right now: 'system' resolves against the OS
// preference, and an embed override wins over both.
export function useResolvedThemeMode() {
  const mode = useThemeStore((state) => state.mode)
  const overrideMode = useThemeStore((state) => state.queryOverrides?.mode)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  if (overrideMode) return overrideMode
  if (mode === 'system') return prefersDark ? 'dark' : 'light'

  return mode
}

// Writes the active theme to the document. Mounted once, at the app shell.
export function useApplyTheme() {
  const resolvedMode = useResolvedThemeMode()
  const primaryColor = useThemeStore((state) => state.primaryColor)
  const fontScale = useThemeStore((state) => state.fontScale)
  const queryOverrides = useThemeStore((state) => state.queryOverrides)

  const fg = queryOverrides?.fg || primaryColor || null
  const bg = queryOverrides?.bg || null

  // Layout effect: the theme must be on the document before the first paint.
  useLayoutEffect(() => {
    applyMode(resolvedMode)
    applyPrimaryColor(fg)
    applyBgColor(bg)

    // Let the browser paint the new variables before reading the resulting color.
    const frame = requestAnimationFrame(syncMetaThemeColor)
    return () => cancelAnimationFrame(frame)
  }, [resolvedMode, fg, bg])

  useLayoutEffect(() => {
    applyFontScale(fontScale)
  }, [fontScale])
}
