import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useQuranStore } from './store'

// Resolves each timings request in the order the test chooses, so a slower
// earlier request can be made to land after a later one.
function deferredFetch() {
  const pending = []
  const fetchMock = vi.fn((url) => {
    return new Promise((resolve) => {
      pending.push({ url, resolve: (body) => resolve({ ok: true, json: async () => body }) })
    })
  })
  return { fetchMock, pending }
}

describe('useQuranStore.loadSurahAudio', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    useQuranStore.setState({ currentSurahNumber: null, surahName: null, ayahTimings: [], currentAyahIndex: -1 })
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('drops timings from a request that is no longer current', async () => {
    const { fetchMock, pending } = deferredFetch()
    globalThis.fetch = fetchMock

    const first = useQuranStore.getState().loadSurahAudio(1, 'الفاتحة')
    const second = useQuranStore.getState().loadSurahAudio(2, 'البقرة')

    expect(pending).toHaveLength(2)
    expect(useQuranStore.getState().currentSurahNumber).toBe(2)

    // The newer request settles first...
    pending[1].resolve([{ ayah: 1, start_time: 0 }])
    await second
    expect(useQuranStore.getState().ayahTimings).toEqual([{ ayah: 1, start_time: 0 }])

    // ...then the stale one arrives and must not overwrite it.
    pending[0].resolve([{ ayah: 1, start_time: 999 }])
    await first
    expect(useQuranStore.getState().ayahTimings).toEqual([{ ayah: 1, start_time: 0 }])
    expect(useQuranStore.getState().currentSurahNumber).toBe(2)
  })

  it('drops timings fetched for a reciter that has since changed', async () => {
    const { fetchMock, pending } = deferredFetch()
    globalThis.fetch = fetchMock

    const initialReciter = useQuranStore.getState().currentReciter
    const load = useQuranStore.getState().loadSurahAudio(1, 'الفاتحة')

    useQuranStore.getState().changeReciter(initialReciter + 1)
    pending[0].resolve([{ ayah: 1, start_time: 0 }])
    await load

    expect(useQuranStore.getState().ayahTimings).toEqual([])
    useQuranStore.getState().changeReciter(initialReciter)
  })
})
