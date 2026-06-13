import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map()

vi.mock('@/composables/useOfflineData', () => ({
  useOfflineData: () => ({
    get: async (k) => store.get(String(k)),
    save: async (k, v) => void store.set(String(k), v),
  }),
}))

const { useAzkarService } = await import('@/services/azkarService')

beforeEach(() => {
  store.clear()
  vi.restoreAllMocks()
})

describe('useAzkarService', () => {
  it('returns a singleton instance', () => {
    expect(useAzkarService()).toBe(useAzkarService())
  })

  it('returns cached data without hitting the network', async () => {
    store.set('morning', [{ text: 'ذكر' }])
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const data = await useAzkarService().fetchCategory('morning')

    expect(data).toEqual([{ text: 'ذكر' }])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches the local JSON file and caches it on a miss', async () => {
    const payload = [{ text: 'سبحان الله' }]
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    })
    vi.stubGlobal('fetch', fetchSpy)

    const data = await useAzkarService().fetchCategory('tasabeeh')

    expect(fetchSpy).toHaveBeenCalledWith('/data/azkar/tasabeeh.json')
    expect(data).toEqual(payload)
    expect(store.get('tasabeeh')).toEqual(payload)
  })

  it('throws a descriptive error on a failed response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(useAzkarService().fetchCategory('missing')).rejects.toThrow('Failed to fetch azkar')
  })
})
