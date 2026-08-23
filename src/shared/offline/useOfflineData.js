import { useSyncExternalStore } from 'react'
import { offlineData } from '@/shared/offline/offlineData'

// Subscribes a component to a namespace's downloaded keys.
export function useOfflineData(namespace) {
  const store = offlineData(namespace)

  const keys = useSyncExternalStore(store.subscribe, store.getKeys, store.getKeys)
  const isReady = useSyncExternalStore(store.subscribe, store.getIsReady, store.getIsReady)

  return {
    ...store,
    keys,
    isReady,
    downloadedCount: keys.length,
    isDownloaded: (key) => keys.includes(String(key)),
  }
}
