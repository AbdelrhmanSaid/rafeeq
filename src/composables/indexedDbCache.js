import { clear as clearStore, createStore, del, get, keys, set } from 'idb-keyval'

const DB_NAME = 'rafeeq-cache'

export const useCache = (storeName) => {
  const store = createStore(DB_NAME, storeName)

  const getCachedItem = async (key, callback) => {
    try {
      const cachedValue = await get(key, store)

      if (cachedValue !== undefined) {
        return cachedValue
      }

      const newValue = await callback()
      await set(key, newValue, store)
      return newValue
    } catch (error) {
      console.error(`IndexedDB cache fallback for key: ${key}`, error)
      return callback()
    }
  }

  const setCachedItem = async (key, value) => {
    try {
      await set(key, value, store)
      return value
    } catch (error) {
      console.error(`Failed to set cache key: ${key}`, error)
      return value
    }
  }

  const hasCachedItem = async (key) => {
    try {
      const value = await get(key, store)
      return value !== undefined
    } catch (error) {
      console.error(`Failed to check cache key: ${key}`, error)
      return false
    }
  }

  const getCacheKeys = async () => {
    try {
      return keys(store)
    } catch (error) {
      console.error(`Failed to get keys for cache store: ${storeName}`, error)
      return []
    }
  }

  const removeCachedItem = async (key) => {
    try {
      await del(key, store)
    } catch (error) {
      console.error(`Failed to remove cache key: ${key}`, error)
    }
  }

  const clearCachedItems = async () => {
    try {
      await clearStore(store)
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
