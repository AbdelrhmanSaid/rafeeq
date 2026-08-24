import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick, ref } from 'vue'

const css = vi.hoisted(() => ({
  applyPrimaryColor: vi.fn(),
  applyBgColor: vi.fn(),
  applyMode: vi.fn(),
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
})
