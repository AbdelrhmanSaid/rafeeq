// Returns the offline-cached value for `key`, or runs `fetcher`, caches it, and
// returns it. `offline` is a useOfflineData(namespace) instance.
// A broken offline store (no IndexedDB) must not take the network path down
// with it, so cache reads and writes fail soft.
// Pass `signal` to skip the save when the caller aborted after the network
// request had already completed.
export async function cachedFetch(offline, key, fetcher, { signal } = {}) {
  const cached = await offline.get(key).catch(() => null)
  if (cached) return cached

  const data = await fetcher()
  if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError')

  await offline.save(key, data).catch(() => {})
  return data
}
