// Returns the offline-cached value for `key`, or runs `fetcher`, caches it, and
// returns it. `offline` is a useOfflineData(namespace) instance.
export async function cachedFetch(offline, key, fetcher) {
  const cached = await offline.get(key)
  if (cached) return cached

  const data = await fetcher()
  await offline.save(key, data)
  return data
}
