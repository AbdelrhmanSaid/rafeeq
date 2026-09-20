export async function cachedFetch(offline, key, fetcher) {
  const cached = await offline.get(key)
  if (cached) return cached

  const data = await fetcher()
  await offline.save(key, data)
  return data
}
