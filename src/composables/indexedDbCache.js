import { del, keys } from 'idb-keyval'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'

export const useCache = (storeName) => {
  const withStorePrefix = (key) => `${storeName}:${String(key)}`

  const getCachedItem = async (key, callback) => {
    const cacheKey = withStorePrefix(key)

    try {
      const { data, isFinished, set } = useIDBKeyval(cacheKey, undefined, { writeDefaults: false })

      while (!isFinished.value) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      if (data.value !== undefined) {
        return data.value
      }

      const newValue = await callback()
      await set(newValue)
      return newValue
    } catch (error) {
      console.error(`IndexedDB cache fallback for key: ${key}`, error)
      return callback()
    }
  }

  const setCachedItem = async (key, value) => {
    const cacheKey = withStorePrefix(key)

    try {
      const { set } = useIDBKeyval(cacheKey, undefined, { writeDefaults: false })
      await set(value)
      return value
    } catch (error) {
      console.error(`Failed to set cache key: ${key}`, error)
      return value
    }
  }

  const hasCachedItem = async (key) => {
    const cacheKey = withStorePrefix(key)

    try {
      const { data, isFinished } = useIDBKeyval(cacheKey, undefined, { writeDefaults: false })

      while (!isFinished.value) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      return data.value !== undefined
    } catch (error) {
      console.error(`Failed to check cache key: ${key}`, error)
      return false
    }
  }

  const getCacheKeys = async () => {
    try {
      const allKeys = await keys()
      const prefix = `${storeName}:`

      return allKeys
        .filter((key) => typeof key === 'string' && key.startsWith(prefix))
        .map((key) => key.slice(prefix.length))
    } catch (error) {
      console.error(`Failed to get keys for cache store: ${storeName}`, error)
      return []
    }
  }

  const removeCachedItem = async (key) => {
    const cacheKey = withStorePrefix(key)

    try {
      await del(cacheKey)
    } catch (error) {
      console.error(`Failed to remove cache key: ${key}`, error)
    }
  }

  const clearCachedItems = async () => {
    try {
      const cacheKeys = await getCacheKeys()
      await Promise.all(cacheKeys.map((key) => del(withStorePrefix(key))))
    } catch (error) {
      console.error(`Failed to clear cache store: ${storeName}`, error)
    }
  }

  return {
    get: getCachedItem,
    set: setCachedItem,
    has: hasCachedItem,
    keys: getCacheKeys,
    remove: removeCachedItem,
    clear: clearCachedItems,
  }
}
