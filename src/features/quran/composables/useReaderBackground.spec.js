import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick, ref } from 'vue'

vi.mock('@/shared/utils/css', () => ({
  applyPrimaryColor: vi.fn(),
  applyBgColor: vi.fn(),
  applyMode: vi.fn(),
  applyPaper: vi.fn(),
  applyFontScale: vi.fn(),
  syncMetaThemeColor: vi.fn(),
  clampFontScale: (value) => value,
  DEFAULT_FONT_SCALE: 100,
}))

vi.mock('@vueuse/core', () => ({
  useLocalStorage: (_key, defaultValue) => ref(defaultValue),
  usePreferredDark: () => ref(false),
}))

import { applyMode, applyPaper } from '@/shared/utils/css'
import { useQuranStore } from '@/features/quran/store'
import { useReaderBackground } from './useReaderBackground'

function mountReader(pinia) {
  const app = createApp({ setup: () => useReaderBackground(), render: () => null })
  app.use(pinia)
  app.mount(document.createElement('div'))
  return app
}

describe('useReaderBackground', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('leaves the app theme alone for the default background', async () => {
    const app = mountReader(pinia)
    await nextTick()

    expect(applyMode).toHaveBeenLastCalledWith('light')
    expect(applyPaper).toHaveBeenLastCalledWith(null)
    app.unmount()
  })

  it('turns the screen dark for a black page and gives the theme back on leaving', async () => {
    const quran = useQuranStore()
    const app = mountReader(pinia)

    quran.readerBackground = 'black'
    await nextTick()
    expect(applyMode).toHaveBeenLastCalledWith('dark')
    expect(applyPaper).toHaveBeenLastCalledWith('black')

    app.unmount()
    await nextTick()
    expect(applyMode).toHaveBeenLastCalledWith('light')
    expect(applyPaper).toHaveBeenLastCalledWith(null)
  })

  it('reads an unknown saved value as the default', async () => {
    const quran = useQuranStore()
    quran.readerBackground = 'sepia'
    const app = mountReader(pinia)
    await nextTick()

    expect(quran.readerBackgroundOption.value).toBe('default')
    expect(applyPaper).toHaveBeenLastCalledWith(null)
    app.unmount()
  })
})
