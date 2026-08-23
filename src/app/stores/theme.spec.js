import { describe, it, expect, vi, afterEach } from 'vitest'

describe('theme store embed overrides', () => {
  afterEach(() => {
    vi.resetModules()
    window.history.replaceState({}, '', '/')
  })

  it('seeds queryOverrides from an embed URL at startup', async () => {
    window.history.replaceState({}, '', '/embed/sebha?mode=dark&fg=%23ff0000&bg=%23000000')
    vi.resetModules()

    const { useThemeStore } = await import('./theme')

    expect(useThemeStore.getState().queryOverrides).toEqual({ mode: 'dark', fg: '#ff0000', bg: '#000000' })
  })

  it('ignores query params outside embed routes', async () => {
    window.history.replaceState({}, '', '/sebha?mode=dark')
    vi.resetModules()

    const { useThemeStore } = await import('./theme')

    expect(useThemeStore.getState().queryOverrides).toBeNull()
  })
})
