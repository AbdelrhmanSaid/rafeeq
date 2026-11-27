import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/shared/offline/useOfflineData', () => ({
  useOfflineData: () => ({ get: async () => null, save: async () => {} }),
}))

const { fetchCategory, isKnownCategory } = await import('./api')

describe('azkar api', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ meta: { name: 'أذكار الصباح' }, content: [] }) })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('knows the slugs in the category list', () => {
    expect(isKnownCategory('morning')).toBe(true)
    expect(isKnownCategory('nope')).toBe(false)
    expect(isKnownCategory(undefined)).toBe(false)
  })

  it('resolves an unknown category to null without a request', async () => {
    await expect(fetchCategory('nope')).resolves.toBe(null)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetches a known category', async () => {
    const data = await fetchCategory('morning')
    expect(data.meta.name).toBe('أذكار الصباح')
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/morning\.json$/))
  })
})
