import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/quran/lib/mushaf', async (importOriginal) => ({
  ...(await importOriginal()),
  // Surah 1 on page 1, surah 2 on pages 2 to 4, and surah 3 sharing page 4.
  surahPages: (surah) => ({ 1: [1], 2: [2, 3, 4], 3: [4, 5] })[surah],
}))

const layout = () => new TextEncoder().encode(JSON.stringify({ lines: [], verses: {} })).buffer
const font = () => new TextEncoder().encode('wOF2 font').buffer

function fakeCaches() {
  const stores = new Map()
  const store = (name) => {
    if (!stores.has(name)) stores.set(name, new Map())
    return stores.get(name)
  }
  const open = async (name) => {
    const entries = store(name)
    return {
      match: async (url) => (entries.has(url) ? new Response(entries.get(url)) : undefined),
      put: async (url, response) => void entries.set(url, await response.arrayBuffer()),
      delete: async (url) => entries.delete(url),
      keys: async () => [...entries.keys()].map((url) => ({ url })),
    }
  }
  return {
    urls: () => [...store('mushaf-v2').keys()],
    names: () => [...stores.keys()],
    open,
    delete: async (name) => stores.delete(name),
  }
}

describe('mushafDownloads', () => {
  let storage
  let caches
  // Fetches of these pages wait until the test lets them go, or their download aborts.
  let held

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    caches = fakeCaches()
    vi.stubGlobal('caches', caches)
    held = new Map()
    vi.stubGlobal(
      'fetch',
      vi.fn((url, { signal } = {}) => {
        const body = String(url).endsWith('.json') ? layout() : font()
        const page = Number(String(url).match(/p?(\d+)\.(json|woff2)$/)[1])
        return new Promise((resolve, reject) => {
          const respond = () => resolve(new Response(body))
          signal?.addEventListener('abort', () => reject(signal.reason))
          if (held.has(page)) held.get(page).push(respond)
          else respond()
        })
      }),
    )
    storage = await import('./mushafStorage')
  })

  afterEach(() => vi.unstubAllGlobals())

  it('downloads every page of a surah and records it', async () => {
    await storage.mushafDownloads.download('2')

    expect(storage.mushafDownloads.isDownloaded('2')).toBe(true)
    expect([...storage.storedPages].sort()).toEqual([2, 3, 4])
  })

  it('stops between pages on abort and records nothing', async () => {
    held.set(3, [])
    const controller = new AbortController()
    const download = storage.mushafDownloads.download('2', { signal: controller.signal })
    await vi.waitFor(() => expect(held.get(3).length).toBe(2))

    controller.abort()
    await expect(download).rejects.toThrow()
    held.get(3).forEach((respond) => respond())
    await new Promise((resolve) => setTimeout(resolve))

    expect(storage.mushafDownloads.isDownloaded('2')).toBe(false)
    expect(storage.storedPages.has(4)).toBe(false)
    expect(caches.urls().some((url) => /p?3\.(json|woff2)$/.test(url))).toBe(false)
  })

  it('takes back what a cancelled download stored, but not pages a downloaded surah owns', async () => {
    await storage.mushafDownloads.download('3')
    held.set(3, [])
    const controller = new AbortController()
    const download = storage.mushafDownloads.download('2', { signal: controller.signal })
    await vi.waitFor(() => expect(held.get(3).length).toBe(2))
    controller.abort()
    await expect(download).rejects.toThrow()

    await storage.mushafDownloads.discard('2')

    expect(storage.storedPages.has(2)).toBe(false)
    expect(storage.storedPages.has(4)).toBe(true)
    expect(storage.mushafDownloads.isDownloaded('3')).toBe(true)
  })

  it('keeps pages stored by reading when a download is discarded', async () => {
    storage.storedPages.add(1)

    await storage.mushafDownloads.discard('1')

    expect(storage.storedPages.has(1)).toBe(true)
  })

  it('drops the cache of the V2 fonts and lists the surahs to download again', async () => {
    await (await caches.open('mushaf-v1')).put('http://localhost:3000/data/mushaf/1.json', new Response(layout()))
    localStorage.setItem('mushaf-downloaded-surahs', JSON.stringify([1, 2]))
    vi.resetModules()
    storage = await import('./mushafStorage')

    await storage.scanStoredPages()

    expect(caches.names()).not.toContain('mushaf-v1')
    expect(storage.hasMushafDownloads()).toBe(true)
    expect(storage.mushafDownloads.missing()).toEqual([1, 2])

    await storage.mushafDownloads.download('1')
    expect(storage.mushafDownloads.missing()).toEqual([2])
  })
})
