import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  document.head.innerHTML = ''
  delete window.gtag
  delete window.dataLayer
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('analytics without a measurement id', () => {
  it('is a no-op and never injects a script', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
    const { trackPageview, enableAutoAnalytics } = await import('@/utilities/analytics')

    expect(() => enableAutoAnalytics()).not.toThrow()
    expect(() => trackPageview('/somewhere')).not.toThrow()
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull()
    expect(window.gtag).toBeUndefined()
  })
})

describe('analytics with a measurement id', () => {
  it('injects the gtag script and bootstraps the dataLayer', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
    const { enableAutoAnalytics } = await import('@/utilities/analytics')

    enableAutoAnalytics()

    const script = document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-TEST123"]')
    expect(script).not.toBeNull()
    expect(typeof window.gtag).toBe('function')
    // js + config calls were pushed
    expect(window.dataLayer.length).toBeGreaterThanOrEqual(2)
  })

  it('sends a page_view event through an already-initialised tracker', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')

    // Simulate gtag already being bootstrapped on the page (e.g. a prior load).
    // This exercises the fast path that resolves the tracker synchronously,
    // avoiding happy-dom's external-script loading which is disabled in tests.
    window.dataLayer = []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    const existing = document.createElement('script')
    existing.src = 'https://www.googletagmanager.com/gtag/js?id=G-TEST123'
    document.head.appendChild(existing)

    const { trackPageview } = await import('@/utilities/analytics')

    trackPageview('/quran')
    await Promise.resolve()
    await Promise.resolve()

    const pageView = window.dataLayer.find((args) => args[0] === 'event' && args[1] === 'page_view')
    expect(pageView).toBeTruthy()
    expect(pageView[2].page_path).toBe('/quran')
  })
})
