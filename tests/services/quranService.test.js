import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map()

vi.mock('@/composables/useOfflineData', () => ({
  useOfflineData: () => ({
    get: async (k) => store.get(String(k)),
    save: async (k, v) => void store.set(String(k), v),
  }),
}))

const { useQuranService } = await import('@/services/quranService')

beforeEach(() => {
  store.clear()
  vi.restoreAllMocks()
})

describe('useQuranService', () => {
  it('returns a singleton instance', () => {
    expect(useQuranService()).toBe(useQuranService())
  })

  it('returns cached data without hitting the network', async () => {
    store.set('2', { cached: true })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const service = useQuranService()
    const data = await service.fetchSurah(2)

    expect(data).toEqual({ cached: true })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches from the alquran.cloud API and caches the result on a miss', async () => {
    const payload = { data: { number: 1 } }
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    })
    vi.stubGlobal('fetch', fetchSpy)

    const service = useQuranService()
    const data = await service.fetchSurah(1)

    expect(fetchSpy).toHaveBeenCalledWith('https://api.alquran.cloud/v1/surah/1')
    expect(data).toEqual(payload)
    expect(store.get('1')).toEqual(payload)
  })

  it('throws a descriptive error on a failed response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const service = useQuranService()
    await expect(service.fetchSurah(99)).rejects.toThrow('Failed to fetch surah')
  })
})
