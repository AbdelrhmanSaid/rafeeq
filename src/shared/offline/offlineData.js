import { get, set, del, keys as idbKeys } from 'idb-keyval'

// Offline copies of remote data, grouped by namespace (e.g. 'quran', 'azkar')
// and stored in IndexedDB under a `namespace.key` prefix. Each namespace has a
// single shared store so every reader sees the same list of downloaded keys.

const stores = new Map()

function createStore(namespace) {
  const prefix = `${namespace}.`
  const listeners = new Set()

  let keys = []
  let isReady = false

  function emit() {
    listeners.forEach((listener) => listener())
  }

  function setKeys(next) {
    keys = next
    emit()
  }

  // Wrapped in a resolved promise: without IndexedDB (some privacy modes,
  // test environments) idb-keyval throws synchronously, and that must degrade
  // to "nothing downloaded" rather than crash whoever imports this module.
  const ready = Promise.resolve()
    .then(() => idbKeys())
    .then((stored) => {
      keys = stored
        .filter((key) => typeof key === 'string' && key.startsWith(prefix))
        .map((key) => key.slice(prefix.length))
    })
    .catch(() => {
      keys = []
    })
    .finally(() => {
      isReady = true
      emit()
    })

  return {
    ready,
    getKeys: () => keys,
    getIsReady: () => isReady,

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    isDownloaded: (key) => keys.includes(String(key)),

    async save(key, data) {
      const id = String(key)
      await set(`${prefix}${id}`, data)
      if (!keys.includes(id)) setKeys([...keys, id])
    },

    get: async (key) => get(`${prefix}${String(key)}`),

    async remove(key) {
      const id = String(key)
      await del(`${prefix}${id}`)
      setKeys(keys.filter((existing) => existing !== id))
    },

    async removeAll() {
      await Promise.all(keys.map((key) => del(`${prefix}${key}`)))
      setKeys([])
    },
  }
}

export function offlineData(namespace) {
  if (!stores.has(namespace)) stores.set(namespace, createStore(namespace))
  return stores.get(namespace)
}
