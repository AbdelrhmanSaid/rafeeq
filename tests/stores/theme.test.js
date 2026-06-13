import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'

beforeEach(() => {
  setActivePinia(createPinia())
  document.body.removeAttribute('data-bs-theme')
  document.documentElement.removeAttribute('style')
  document.body.removeAttribute('style')
})

describe('theme store', () => {
  it('defaults to system mode and resolves to light (matchMedia mocked to no dark)', () => {
    const store = useThemeStore()
    expect(store.mode).toBe('system')
    expect(store.isDark).toBe(false)
  })

  it('setMode accepts valid modes and ignores invalid ones', () => {
    const store = useThemeStore()
    store.setMode('dark')
    expect(store.mode).toBe('dark')
    expect(store.isDark).toBe(true)

    store.setMode('banana')
    expect(store.mode).toBe('dark')
  })

  it('toggle switches between light and dark', () => {
    const store = useThemeStore()
    store.setMode('light')
    store.toggle()
    expect(store.mode).toBe('dark')
    store.toggle()
    expect(store.mode).toBe('light')
  })

  it('setPrimaryColor stores the color and normalizes empty to an empty string', () => {
    const store = useThemeStore()
    store.setPrimaryColor('red')
    expect(store.primaryColor).toBe('red')
    store.setPrimaryColor(null)
    expect(store.primaryColor).toBe('')
  })

  it('applies the resolved mode to the document body', async () => {
    const store = useThemeStore()
    store.setMode('dark')
    await nextTick()
    expect(document.body.getAttribute('data-bs-theme')).toBe('dark')
  })

  it('applyQueryOverrides applies mode and colors from query params', () => {
    const store = useThemeStore()
    store.applyQueryOverrides({ mode: 'dark', fg: 'red' })
    expect(document.body.getAttribute('data-bs-theme')).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--bs-primary')).toBe('red')
  })

  it('applyQueryOverrides ignores an invalid mode value', () => {
    const store = useThemeStore()
    document.body.setAttribute('data-bs-theme', 'light')
    store.applyQueryOverrides({ mode: 'nope' })
    expect(document.body.getAttribute('data-bs-theme')).toBe('light')
  })
})
