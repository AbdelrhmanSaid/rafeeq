import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/shared/utils/async', () => ({ sleep: () => Promise.resolve() }))

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal()
  const { ref } = await import('vue')
  return { ...actual, useOnline: () => ref(true) }
})

vi.mock('@/shared/offline/useOfflineData', async () => {
  const { ref, computed } = await import('vue')
  const stores = new Map()
  globalThis.__offline = stores
  return {
    useOfflineData: (namespace) => {
      if (!stores.has(namespace)) {
        const keys = ref([])
        stores.set(namespace, {
          keys,
          downloadedCount: computed(() => keys.value.length),
          isDownloaded: (key) => keys.value.includes(String(key)),
          add: (key) => {
            if (!keys.value.includes(String(key))) keys.value = [...keys.value, String(key)]
          },
          remove: vi.fn(async (key) => {
            keys.value = keys.value.filter((k) => k !== String(key))
          }),
          removeAll: vi.fn(async () => {
            keys.value = []
          }),
        })
      }
      return stores.get(namespace)
    },
  }
})

const fetchSurah = vi.fn()
const fetchCategory = vi.fn()
vi.mock('@/features/quran/api', () => ({ fetchSurah: (...a) => fetchSurah(...a) }))
vi.mock('@/features/azkar/api', () => ({ fetchCategory: (...a) => fetchCategory(...a) }))

const { useDownloadStore } = await import('./store')
const surahs = (await import('@/features/quran/data/surahs.js')).default
const categories = (await import('@/features/azkar/data/categories.js')).default

const offline = (ns) => globalThis.__offline.get(ns)

// Drive the async processQueue loop to completion (sleep is stubbed to a microtask).
const drain = async (store) => {
  for (let i = 0; i < 500 && store.isDownloading; i++) await Promise.resolve()
  await nextTick()
}

beforeEach(() => {
  setActivePinia(createPinia())
  globalThis.__offline?.forEach((s) => (s.keys.value = []))
  // Reset call history (module-level vi.fns aren't covered by restoreMocks),
  // then make a successful fetch mark the asset as downloaded offline.
  fetchSurah.mockReset()
  fetchCategory.mockReset()
  fetchSurah.mockImplementation(async (id) => offline('quran').add(id))
  fetchCategory.mockImplementation(async (slug) => offline('azkar').add(slug))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('aggregate counts', () => {
  it('totals every surah and azkar category', () => {
    const store = useDownloadStore()
    expect(store.totalAssets).toBe(surahs.length + categories.length)
    expect(store.downloadedCount).toBe(0)
    expect(store.isCompleted).toBe(false)
    expect(store.progressPercentage).toBe(0)
  })

  it('derives progress from the offline stores', () => {
    const store = useDownloadStore()
    offline('quran').add(surahs[0].id)
    expect(store.downloadedCount).toBe(1)
    expect(store.progressPercentage).toBe(Math.round((1 / store.totalAssets) * 100))
  })
})

describe('queueing', () => {
  it('downloads a queued asset and drains the queue', async () => {
    const store = useDownloadStore()
    const asset = store.allAssets.find((a) => a.type === 'surah')

    store.queueAsset(asset)
    await drain(store)

    expect(fetchSurah).toHaveBeenCalledTimes(1)
    expect(store.isDownloaded(asset)).toBe(true)
    expect(store.pendingCount).toBe(0)
    expect(store.isDownloading).toBe(false)
  })

  it('skips assets that are already downloaded', () => {
    const store = useDownloadStore()
    const asset = store.allAssets.find((a) => a.type === 'azkar')
    offline('azkar').add(asset.key)

    store.queueAsset(asset)

    expect(store.pendingCount).toBe(0)
    expect(fetchCategory).not.toHaveBeenCalled()
  })

  it('does not enqueue the same asset twice', () => {
    const store = useDownloadStore()
    store.pauseDownloads() // freeze the queue so it can be inspected
    const asset = store.allAssets[0]

    store.queueAsset(asset)
    store.queueAsset(asset)

    expect(store.pendingCount).toBe(1)
  })

  it('queues every not-yet-downloaded asset', () => {
    const store = useDownloadStore()
    store.pauseDownloads()

    store.queueAllAssets()

    expect(store.pendingCount).toBe(store.totalAssets)
  })
})

describe('retry on failure', () => {
  it('re-queues an asset to the back when its download throws', async () => {
    const store = useDownloadStore()
    const [first, second] = store.allAssets.filter((a) => a.type === 'surah')

    fetchSurah.mockImplementationOnce(async () => {
      throw new Error('network')
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    store.downloadQueue = [first, second]
    store.resumeDownloads()
    await drain(store)

    // Both succeed: the failed one is retried after being pushed to the back.
    expect(store.isDownloaded(first)).toBe(true)
    expect(store.isDownloaded(second)).toBe(true)
    expect(fetchSurah).toHaveBeenCalledTimes(3)
  })
})

describe('queue controls', () => {
  it('removes a specific asset from the queue', () => {
    const store = useDownloadStore()
    store.pauseDownloads()
    const [a, b] = store.allAssets

    store.downloadQueue = [a, b]
    store.removeFromQueue(a)

    expect(store.pendingCount).toBe(1)
    expect(store.downloadQueue[0].id).toBe(b.id)
  })

  it('cancels all pending downloads', () => {
    const store = useDownloadStore()
    store.pauseDownloads()
    store.queueAllAssets()

    store.cancelAllDownloads()

    expect(store.pendingCount).toBe(0)
    expect(store.isPaused).toBe(false)
  })

  it('removes downloaded assets via the offline store', async () => {
    const store = useDownloadStore()
    const asset = store.allAssets.find((a) => a.type === 'surah')
    offline('quran').add(asset.key)

    await store.removeAsset(asset)
    expect(offline('quran').remove).toHaveBeenCalledWith(asset.key)

    await store.removeAllAssets()
    expect(offline('quran').removeAll).toHaveBeenCalled()
    expect(offline('azkar').removeAll).toHaveBeenCalled()
  })
})
