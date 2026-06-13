import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// nProgress and analytics touch globals/timers; keep them inert.
vi.mock('nprogress', () => ({ default: { start: vi.fn(), done: vi.fn() } }))
vi.mock('@/utilities/analytics', () => ({ trackPageview: vi.fn() }))

import router from '@/router'

beforeEach(() => {
  setActivePinia(createPinia())
})

const routeNames = () => router.getRoutes().map((r) => r.name)

describe('router - route table', () => {
  it('registers the core named routes', () => {
    const names = routeNames()
    for (const name of [
      'home',
      'quran',
      'quran-surah',
      'azkar',
      'azkar-category',
      'radio',
      'radio-station',
      'sebha',
      'qibla',
      'zakat',
      'settings',
      'privacy',
      'not-found',
    ]) {
      expect(names).toContain(name)
    }
  })

  it('adds /embed aliases to non-embed routes', () => {
    const quran = router.getRoutes().find((r) => r.name === 'quran')
    expect(quran.aliasOf || quran).toBeTruthy()
    // The alias path should be resolvable.
    const resolved = router.resolve('/embed/quran')
    expect(resolved.name).toBe('quran')
  })

  it('does not add an embed alias to the embed-component route', () => {
    const resolved = router.resolve('/embed/components/sebha')
    expect(resolved.name).toBe('embed-component')
    // It should not have produced a double /embed/embed alias.
    expect(router.resolve('/embed/embed/components/sebha').name).toBe('not-found')
  })

  it('matches unknown paths to the not-found route', () => {
    const resolved = router.resolve('/this/does/not/exist')
    expect(resolved.name).toBe('not-found')
  })

  it('constrains the surah param to digits', () => {
    expect(router.resolve('/quran/2').name).toBe('quran-surah')
    expect(router.resolve('/quran/abc').name).not.toBe('quran-surah')
  })
})

describe('router - navigation hooks', () => {
  it('updates the document title from route meta after navigation', async () => {
    await router.push('/')
    await router.isReady()
    expect(document.title).toContain('الرئيسية')
  })
})
