import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDownloadStore } from './store'
import { mushafDownloads } from '@/features/quran/lib/mushafStorage'
import { toast } from 'vue-sonner'

const online = vi.hoisted(() => ({ value: true }))

vi.mock('@vueuse/core', async (importOriginal) => ({ ...(await importOriginal()), useOnline: () => online }))
vi.mock('vue-sonner', () => ({ toast: { error: vi.fn() } }))
vi.mock('idb-keyval', () => ({ keys: async () => [], delMany: async () => {} }))
vi.mock('@/shared/utils/async', () => ({ sleep: () => new Promise((resolve) => setTimeout(resolve, 0)) }))

vi.mock('@/shared/offline/useOfflineData', async () => {
  const { computed, reactive } = await import('vue')
  const keys = reactive(new Set())
  const offline = {
    keys,
    downloadedCount: computed(() => keys.size),
    isDownloaded: (key) => keys.has(String(key)),
    save: async (key) => keys.add(String(key)),
    remove: vi.fn(async (key) => keys.delete(String(key))),
    removeAll: vi.fn(async () => keys.clear()),
  }
  return { useOfflineData: () => offline }
})

vi.mock('@/features/azkar/api', async () => {
  const { useOfflineData } = await import('@/shared/offline/useOfflineData')
  return { fetchCategory: async (slug) => useOfflineData('azkar').save(slug) }
})

// A Mushaf download that finishes when the test says so and, like the real one, records nothing once aborted.
vi.mock('@/features/quran/lib/mushafStorage', async () => {
  const { computed, reactive } = await import('vue')
  const downloaded = reactive(new Set())
  const running = []
  return {
    scanStoredPages: async () => {},
    mushafDownloads: {
      downloaded,
      running,
      downloadedCount: computed(() => downloaded.size),
      isDownloaded: (key) => downloaded.has(String(key)),
      download: vi.fn(
        (key, { signal }) =>
          new Promise((resolve, reject) => {
            const finish = () => (signal.aborted ? reject(signal.reason) : (downloaded.add(key), resolve()))
            const run = { key, finish, fail: reject }
            running.push(run)
            signal.addEventListener('abort', () => reject(signal.reason))
          }),
      ),
      discard: vi.fn(async () => {}),
      remove: vi.fn(async (key) => downloaded.delete(String(key))),
      removeAll: vi.fn(async () => downloaded.clear()),
    },
  }
})

const flush = () => new Promise((resolve) => setTimeout(resolve, 5))

describe('download store', () => {
  let store
  let fatiha
  let baqarah

  beforeEach(() => {
    online.value = true
    mushafDownloads.downloaded.clear()
    mushafDownloads.running.length = 0
    setActivePinia(createPinia())
    store = useDownloadStore()
    ;[fatiha, baqarah] = store.allAssets
  })

  it('stops the surah downloading on cancel, without recording or keeping it', async () => {
    store.queueAsset(fatiha)
    store.queueAsset(baqarah)
    await flush()
    expect(store.currentItem?.id).toBe(fatiha.id)

    await store.cancelAllDownloads()
    // The network finishing late changes nothing.
    mushafDownloads.running[0].finish()
    await flush()

    expect(store.downloadQueue).toEqual([])
    expect(store.currentItem).toBeNull()
    expect(store.isDownloading).toBe(false)
    expect(mushafDownloads.discard).toHaveBeenCalledWith('1')
    expect(store.isDownloaded(fatiha)).toBe(false)
    expect(mushafDownloads.download).toHaveBeenCalledTimes(1)
  })

  it('waits for the running download before removing everything', async () => {
    const order = []
    mushafDownloads.discard.mockImplementationOnce(async () => order.push('discard'))
    mushafDownloads.removeAll.mockImplementationOnce(async () => order.push('removeAll'))

    store.queueAsset(fatiha)
    await flush()
    await store.removeAllAssets()
    await flush()

    expect(order).toEqual(['discard', 'removeAll'])
    expect(store.downloadedCount).toBe(0)
    expect(store.isDownloading).toBe(false)
  })

  it('pausing stops the current item, keeps it first in the queue and resumes it', async () => {
    store.queueAsset(fatiha)
    store.queueAsset(baqarah)
    await flush()

    store.pauseDownloads()
    await flush()

    expect(store.isDownloading).toBe(false)
    expect(store.currentItem).toBeNull()
    expect(store.downloadQueue.map((a) => a.id)).toEqual([fatiha.id, baqarah.id])
    expect(mushafDownloads.discard).not.toHaveBeenCalled()

    store.resumeDownloads()
    await flush()
    expect(store.currentItem?.id).toBe(fatiha.id)
    mushafDownloads.running.at(-1).finish()
    await flush()
    expect(store.isDownloaded(fatiha)).toBe(true)
    expect(store.currentItem?.id).toBe(baqarah.id)
  })

  it('cancels one queued item that is downloading', async () => {
    store.queueAsset(fatiha)
    store.queueAsset(baqarah)
    await flush()

    await store.removeFromQueue(fatiha)
    await flush()

    expect(mushafDownloads.discard).toHaveBeenCalledWith('1')
    expect(store.currentItem?.id).toBe(baqarah.id)
  })

  it('clears the current item while offline, and keeps a dropped item queued without counting a try', async () => {
    store.queueAsset(fatiha)
    await flush()

    online.value = false
    mushafDownloads.running[0].fail(new TypeError('Failed to fetch'))
    await flush()

    expect(store.currentItem).toBeNull()
    expect(store.downloadQueue.map((a) => a.id)).toEqual([fatiha.id])
    expect(toast.error).not.toHaveBeenCalled()

    online.value = true
    await new Promise((resolve) => setTimeout(resolve, 20))
    mushafDownloads.running.at(-1).finish()
    await flush()
    expect(store.isDownloaded(fatiha)).toBe(true)
    expect(store.isDownloading).toBe(false)
  })

  it('takes back an azkar category cancelled while it loads', async () => {
    const category = store.allAssets.find((a) => a.type === 'azkar')
    store.queueAsset(fatiha)
    store.queueAsset(category)
    await flush()
    mushafDownloads.running[0].finish()
    // The category starts after the surah; cancel straight away.
    await new Promise((resolve) => setTimeout(resolve, 1))
    await store.cancelAllDownloads()
    await flush()

    expect(store.isDownloaded(category)).toBe(false)
  })

  it('never shows 0% once something is downloaded', async () => {
    store.queueAsset(fatiha)
    await flush()
    mushafDownloads.running[0].finish()
    await flush()

    expect(store.progressPercentage).toBe(1)
  })
})
