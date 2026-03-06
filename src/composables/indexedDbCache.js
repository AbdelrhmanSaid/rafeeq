const DB_NAME = 'rafeeq-cache'
const DB_VERSION = 1

const openDatabase = (storeName) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName)
      }
    }

    request.onsuccess = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(storeName)) {
        database.close()
        const upgradedRequest = window.indexedDB.open(DB_NAME, database.version + 1)

        upgradedRequest.onupgradeneeded = () => {
          const upgradedDatabase = upgradedRequest.result
          if (!upgradedDatabase.objectStoreNames.contains(storeName)) {
            upgradedDatabase.createObjectStore(storeName)
          }
        }

        upgradedRequest.onsuccess = () => resolve(upgradedRequest.result)
        upgradedRequest.onerror = () => reject(upgradedRequest.error)
        return
      }

      resolve(database)
    }

    request.onerror = () => reject(request.error)
  })
}

const runRequest = (request) => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const useCache = (storeName) => {
  const get = async (key, callback) => {
    try {
      const database = await openDatabase(storeName)
      const readTransaction = database.transaction(storeName, 'readonly')
      const readStore = readTransaction.objectStore(storeName)
      const cachedValue = await runRequest(readStore.get(key))

      if (cachedValue !== undefined) {
        return cachedValue
      }

      const newValue = await callback()

      const writeTransaction = database.transaction(storeName, 'readwrite')
      const writeStore = writeTransaction.objectStore(storeName)
      await runRequest(writeStore.put(newValue, key))

      return newValue
    } catch (error) {
      console.error(`IndexedDB cache fallback for key: ${key}`, error)
      return callback()
    }
  }

  const set = async (key, value) => {
    try {
      const database = await openDatabase(storeName)
      const transaction = database.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      await runRequest(store.put(value, key))
      return value
    } catch (error) {
      console.error(`Failed to set cache key: ${key}`, error)
      return value
    }
  }

  const has = async (key) => {
    try {
      const database = await openDatabase(storeName)
      const transaction = database.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const value = await runRequest(store.get(key))
      return value !== undefined
    } catch (error) {
      console.error(`Failed to check cache key: ${key}`, error)
      return false
    }
  }

  const keys = async () => {
    try {
      const database = await openDatabase(storeName)
      const transaction = database.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      return runRequest(store.getAllKeys())
    } catch (error) {
      console.error(`Failed to get keys for cache store: ${storeName}`, error)
      return []
    }
  }

  const remove = async (key) => {
    try {
      const database = await openDatabase(storeName)
      const transaction = database.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      await runRequest(store.delete(key))
    } catch (error) {
      console.error(`Failed to remove cache key: ${key}`, error)
    }
  }

  const clear = async () => {
    try {
      const database = await openDatabase(storeName)
      const transaction = database.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      await runRequest(store.clear())
    } catch (error) {
      console.error(`Failed to clear cache store: ${storeName}`, error)
    }
  }

  return {
    get,
    set,
    has,
    keys,
    remove,
    clear,
  }
}
