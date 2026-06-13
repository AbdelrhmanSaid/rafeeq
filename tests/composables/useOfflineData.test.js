import { describe, it, expect, vi, beforeEach } from 'vitest'

// In-memory stand-in for idb-keyval so tests don't need a real IndexedDB.
vi.mock('idb-keyval', () => {
  const store = new Map()
  return {
    get: vi.fn(async (k) => store.get(k)),
    set: vi.fn(async (k, v) => void store.set(k, v)),
    del: vi.fn(async (k) => void store.delete(k)),
    keys: vi.fn(async () => Array.from(store.keys())),
    __store: store,
  }
})

vi.mock('@vueuse/integrations/useIDBKeyval', async () => {
  const { ref } = await import('vue')
  return {
    useIDBKeyval: (_key, initial) => ({ data: ref(initial), isFinished: ref(true) }),
  }
})

const { useOfflineData } = await import('@/composables/useOfflineData')
const idb = await import('idb-keyval')

beforeEach(() => {
  idb.__store.clear()
})

describe('useOfflineData', () => {
  it('returns the same instance for a namespace (singleton per namespace)', () => {
    const a = useOfflineData('ns-singleton')
    const b = useOfflineData('ns-singleton')
    expect(a.keys).toBe(b.keys)
  })

  it('saves data under a namespaced key and tracks it', async () => {
    const offline = useOfflineData('quran-save')
    await offline.save(1, { surah: 1 })

    expect(idb.__store.get('quran-save.1')).toEqual({ surah: 1 })
    expect(offline.keys.value).toContain('1')
    expect(offline.isDownloaded(1)).toBe(true)
    expect(offline.downloadedCount.value).toBe(1)
  })

  it('does not duplicate a key when saving twice', async () => {
    const offline = useOfflineData('quran-dup')
    await offline.save('a', 1)
    await offline.save('a', 2)
    expect(offline.keys.value.filter((k) => k === 'a')).toHaveLength(1)
    expect(await offline.get('a')).toBe(2)
  })

  it('retrieves stored data via get', async () => {
    const offline = useOfflineData('quran-get')
    await offline.save('k', { hello: 'world' })
    expect(await offline.get('k')).toEqual({ hello: 'world' })
  })

  it('removes a single key', async () => {
    const offline = useOfflineData('quran-remove')
    await offline.save('a', 1)
    await offline.save('b', 2)
    await offline.remove('a')

    expect(offline.isDownloaded('a')).toBe(false)
    expect(offline.isDownloaded('b')).toBe(true)
    expect(idb.__store.has('quran-remove.a')).toBe(false)
  })

  it('removes all keys', async () => {
    const offline = useOfflineData('quran-removeall')
    await offline.save('a', 1)
    await offline.save('b', 2)
    await offline.removeAll()

    expect(offline.keys.value).toEqual([])
    expect(offline.downloadedCount.value).toBe(0)
    expect(idb.__store.size).toBe(0)
  })

  it('coerces numeric keys to strings consistently', async () => {
    const offline = useOfflineData('quran-coerce')
    await offline.save(7, 'data')
    expect(offline.isDownloaded(7)).toBe(true)
    expect(offline.isDownloaded('7')).toBe(true)
  })
})
