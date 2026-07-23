import { del, keys as allIdbKeys } from 'idb-keyval'

// One-time cleanup of offline data whose stored shape is no longer readable.
// v2: quran moved from alquran.cloud responses ('quran.*') to the pre-generated
// mushaf payloads ('mushaf.*') — old entries are useless to the new renderer.
export async function runOfflineMigrations() {
  const stored = await allIdbKeys()
  const legacy = stored.filter((key) => typeof key === 'string' && key.startsWith('quran.'))
  if (legacy.length === 0) return
  await Promise.all([...legacy.map((key) => del(key)), del('offline-quran')])
}
