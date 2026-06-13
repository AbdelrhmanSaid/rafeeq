import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'

// Make queue processing synchronous-ish by removing the artificial delays.
vi.mock('@/utilities/async', () => ({ sleep: () => Promise.resolve() }))

// Keep the app online for the duration of the tests.
vi.mock('@vueuse/core', async (importActual) => {
  const actual = await importActual()
  const { ref } = await import('vue')
  return { ...actual, useOnline: () => ref(true) }
})

vi.mock('@/services/quranService', async () => {
  const { ref } = await import('vue')
  const downloadedCount = ref(0)
  const downloaded = new Set()
  return {
    __state: { downloadedCount, downloaded },
    useQuranService: () => ({
      downloadedCount,
      isDownloaded: (k) => downloaded.has(String(k)),
      fetchSurah: vi.fn(async (id) => {
        downloaded.add(String(id))
        downloadedCount.value = downloaded.size
      }),
      remove: vi.fn(async (k) => {
        downloaded.delete(String(k))
        downloadedCount.value = downloaded.size
      }),
      removeAll: vi.fn(async () => {
        downloaded.clear()
        downloadedCount.value = 0
      }),
    }),
  }
})

vi.mock('@/services/azkarService', async () => {
  const { ref } = await import('vue')
  const downloadedCount = ref(0)
  const downloaded = new Set()
  return {
    __state: { downloadedCount, downloaded },
    useAzkarService: () => ({
      downloadedCount,
      isDownloaded: (k) => downloaded.has(String(k)),
      fetchCategory: vi.fn(async (slug) => {
        downloaded.add(String(slug))
        downloadedCount.value = downloaded.size
      }),
      remove: vi.fn(async (k) => {
        downloaded.delete(String(k))
        downloadedCount.value = downloaded.size
      }),
      removeAll: vi.fn(async () => {
        downloaded.clear()
        downloadedCount.value = 0
      }),
    }),
  }
})

const { useDownloadStore } = await import('@/stores/download')
const quranMock = await import('@/services/quranService')
const azkarMock = await import('@/services/azkarService')

const TOTAL = surahs.length + azkarCategories.length

beforeEach(() => {
  setActivePinia(createPinia())
  quranMock.__state.downloaded.clear()
  quranMock.__state.downloadedCount.value = 0
  azkarMock.__state.downloaded.clear()
  azkarMock.__state.downloadedCount.value = 0
})

describe('download store - asset catalog', () => {
  it('combines surahs and azkar categories into one asset list', () => {
    const store = useDownloadStore()
    expect(store.totalAssets).toBe(TOTAL)
    expect(store.allAssets).toHaveLength(TOTAL)
  })

  it('produces well-formed surah and azkar asset descriptors', () => {
    const store = useDownloadStore()
    const surah = store.allAssets.find((a) => a.type === 'surah')
    const azkar = store.allAssets.find((a) => a.type === 'azkar')

    expect(surah.id).toMatch(/^surah-/)
    expect(surah.key).toBe(String(surah.data.id))
    expect(azkar.id).toMatch(/^azkar-/)
    expect(azkar.key).toBe(azkar.data.slug)
  })

  it('reports zero progress initially', () => {
    const store = useDownloadStore()
    expect(store.downloadedCount).toBe(0)
    expect(store.progressPercentage).toBe(0)
    expect(store.isCompleted).toBe(false)
  })
})

describe('download store - progress computeds', () => {
  it('computes progress percentage from downloaded counts', () => {
    const store = useDownloadStore()
    quranMock.__state.downloadedCount.value = surahs.length
    azkarMock.__state.downloadedCount.value = 0
    expect(store.downloadedCount).toBe(surahs.length)
    expect(store.progressPercentage).toBe(Math.round((surahs.length / TOTAL) * 100))
  })

  it('marks completion when everything is downloaded', () => {
    const store = useDownloadStore()
    quranMock.__state.downloadedCount.value = surahs.length
    azkarMock.__state.downloadedCount.value = azkarCategories.length
    expect(store.isCompleted).toBe(true)
    expect(store.progressPercentage).toBe(100)
  })
})

describe('download store - queue management', () => {
  it('queueAsset downloads an asset and drains the queue', async () => {
    const store = useDownloadStore()
    const asset = store.allAssets.find((a) => a.type === 'surah')

    store.queueAsset(asset)
    await vi.waitFor(() => expect(store.pendingCount).toBe(0))

    expect(store.isDownloaded(asset)).toBe(true)
    expect(store.isDownloading).toBe(false)
  })

  it('does not enqueue an already-downloaded asset', () => {
    const store = useDownloadStore()
    const asset = store.allAssets.find((a) => a.type === 'azkar')
    azkarMock.__state.downloaded.add(asset.key)

    store.queueAsset(asset)
    expect(store.pendingCount).toBe(0)
  })

  it('paused queueing keeps items pending until resumed', async () => {
    const store = useDownloadStore()
    store.pauseDownloads()

    const asset = store.allAssets.find((a) => a.type === 'surah')
    store.queueAsset(asset)
    expect(store.pendingCount).toBe(1)

    store.removeFromQueue(asset)
    expect(store.pendingCount).toBe(0)
  })

  it('queueAllAssets enqueues every pending asset while paused', () => {
    const store = useDownloadStore()
    store.pauseDownloads()
    store.queueAllAssets()
    expect(store.pendingCount).toBe(TOTAL)

    store.cancelAllDownloads()
    expect(store.pendingCount).toBe(0)
    expect(store.isPaused).toBe(false)
  })
})

describe('download store - removal', () => {
  it('removeAsset delegates to the matching service', async () => {
    const store = useDownloadStore()
    const asset = store.allAssets.find((a) => a.type === 'surah')
    quranMock.__state.downloaded.add(asset.key)

    await store.removeAsset(asset)
    expect(store.isDownloaded(asset)).toBe(false)
  })

  it('removeAllAssets clears both services', async () => {
    const store = useDownloadStore()
    quranMock.__state.downloaded.add('1')
    quranMock.__state.downloadedCount.value = 1
    azkarMock.__state.downloaded.add('morning')
    azkarMock.__state.downloadedCount.value = 1

    await store.removeAllAssets()
    expect(store.downloadedCount).toBe(0)
  })
})
