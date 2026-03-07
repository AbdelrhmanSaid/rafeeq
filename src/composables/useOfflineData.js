import { computed } from 'vue'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'
import { get, set, del } from 'idb-keyval'

const instances = new Map()

export function useOfflineData(namespace) {
  if (!instances.has(namespace)) {
    const { data: keys, isFinished } = useIDBKeyval(`offline-${namespace}`, [])
    instances.set(namespace, { keys, isFinished })
  }

  const { keys, isFinished } = instances.get(namespace)
  const downloadedCount = computed(() => keys.value.length)

  const isDownloaded = (key) => keys.value.includes(String(key))

  async function save(key, data) {
    const k = String(key)
    await set(`${namespace}.${k}`, data)
    if (!keys.value.includes(k)) {
      keys.value = [...keys.value, k]
    }
  }

  async function getData(key) {
    return await get(`${namespace}.${String(key)}`)
  }

  async function remove(key) {
    const k = String(key)
    await del(`${namespace}.${k}`)
    keys.value = keys.value.filter((i) => i !== k)
  }

  async function removeAll() {
    for (const key of keys.value) await del(`${namespace}.${key}`)
    keys.value = []
  }

  return {
    keys,
    isFinished,
    downloadedCount,
    isDownloaded,
    save,
    get: getData,
    remove,
    removeAll,
  }
}
