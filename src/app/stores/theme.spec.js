import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick, ref } from 'vue'

const css = vi.hoisted(() => ({
  applyPrimaryColor: vi.fn(),
  applyBgColor: vi.fn(),
  applyMode: vi.fn(),
  applyPaper: vi.fn(),
  applyFontScale: vi.fn(),
  syncMetaThemeColor: vi.fn(),
}))

vi.mock('@/shared/utils/css', () => ({
  ...css,
  clampFontScale: (value) => value,
  DEFAULT_FONT_SCALE: 100,
}))

vi.mock('@vueuse/core', () => ({
  useLocalStorage: (_key, defaultValue) => ref(defaultValue),
  usePreferredDark: () => ref(false),
}))

import { useThemeStore } from './theme'

describe('theme store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('removes the custom primary color when the default is selected', async () => {
    const theme = useThemeStore()

    theme.setPrimaryColor('#1565C0')
    await nextTick()
    theme.setPrimaryColor('')
    await nextTick()

    expect(css.applyPrimaryColor).toHaveBeenLastCalledWith(null)
  })

  it('keeps the light and dark values saved before the new looks', async () => {
    const theme = useThemeStore()

    theme.setMode('dark')
    await nextTick()
    expect(css.applyMode).toHaveBeenLastCalledWith('dark')
    expect(css.applyPaper).toHaveBeenLastCalledWith(null)
  })

  it.each([
    ['paper', 'light'],
    ['black', 'dark'],
  ])('draws %s on top of the %s scheme', async (look, scheme) => {
    const theme = useThemeStore()

    theme.setMode(look)
    await nextTick()
    expect(css.applyMode).toHaveBeenLastCalledWith(scheme)
    expect(css.applyPaper).toHaveBeenLastCalledWith(look)
  })

  it('ignores an unknown look', () => {
    const theme = useThemeStore()

    theme.setMode('sepia')
    expect(theme.mode).toBe('system')
  })

  it("lets an embed's scheme win over the saved look, without its paper", async () => {
    const theme = useThemeStore()

    theme.setMode('black')
    theme.applyQueryOverrides({ mode: 'light' })
    await nextTick()

    expect(css.applyMode).toHaveBeenLastCalledWith('light')
    expect(css.applyPaper).toHaveBeenLastCalledWith(null)
  })
})
