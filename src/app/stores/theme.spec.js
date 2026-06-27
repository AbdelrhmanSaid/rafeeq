import { beforeEach, describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { DEFAULT_FONT_SCALE, MAX_FONT_SCALE, MIN_FONT_SCALE } from '@/shared/utils/css'
import { useThemeStore } from './theme'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  document.body.removeAttribute('data-bs-theme')
})

describe('mode', () => {
  it('defaults to system', () => {
    expect(useThemeStore().mode).toBe('system')
  })

  it('accepts the valid modes and ignores anything else', () => {
    const store = useThemeStore()

    store.setMode('dark')
    expect(store.mode).toBe('dark')

    store.setMode('weird')
    expect(store.mode).toBe('dark')
  })

  it('reflects the resolved mode on the document body', async () => {
    const store = useThemeStore()

    store.setMode('dark')
    await nextTick()
    expect(document.body.getAttribute('data-bs-theme')).toBe('dark')

    store.setMode('light')
    await nextTick()
    expect(document.body.getAttribute('data-bs-theme')).toBe('light')
  })
})

describe('font scale', () => {
  it('clamps assigned values to the supported range', () => {
    const store = useThemeStore()

    store.setFontScale(MAX_FONT_SCALE + 1000)
    expect(store.fontScale).toBe(MAX_FONT_SCALE)

    store.setFontScale(MIN_FONT_SCALE - 1000)
    expect(store.fontScale).toBe(MIN_FONT_SCALE)
  })

  it('resets to the default', () => {
    const store = useThemeStore()
    store.setFontScale(MIN_FONT_SCALE)
    store.resetFontScale()
    expect(store.fontScale).toBe(DEFAULT_FONT_SCALE)
  })
})

describe('applyQueryOverrides', () => {
  it('applies a mode override to the document body', () => {
    useThemeStore().applyQueryOverrides({ mode: 'dark' })
    expect(document.body.getAttribute('data-bs-theme')).toBe('dark')
  })

  it('ignores an invalid mode override', () => {
    useThemeStore().applyQueryOverrides({ mode: 'rainbow' })
    expect(document.body.getAttribute('data-bs-theme')).not.toBe('rainbow')
  })
})
