import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'

vi.mock('@vueuse/core', () => ({
  useLocalStorage: (_key, defaultValue) => ref(defaultValue),
}))

import { useQuranStore } from '@/features/quran/store'
import { useReaderBackground } from './useReaderBackground'

describe('useReaderBackground', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('gives the page no look of its own for the default background', () => {
    expect(useReaderBackground().value).toEqual({})
  })

  it("paints the page in the chosen look's scheme and paper", () => {
    const quran = useQuranStore()
    const look = useReaderBackground()

    quran.readerBackground = 'black'
    expect(look.value).toEqual({ 'data-bs-theme': 'dark', 'data-app-paper': 'black' })

    quran.readerBackground = 'paper'
    expect(look.value).toEqual({ 'data-bs-theme': 'light', 'data-app-paper': 'paper' })

    quran.readerBackground = 'dark'
    expect(look.value).toEqual({ 'data-bs-theme': 'dark', 'data-app-paper': undefined })
  })

  it('reads an unknown saved value as the default', () => {
    const quran = useQuranStore()
    quran.readerBackground = 'sepia'

    expect(quran.readerBackgroundOption.value).toBe('default')
    expect(useReaderBackground().value).toEqual({})
  })
})
