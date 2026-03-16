import { computed, watch } from 'vue'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'
import { get, set, del, keys as allIdbKeys } from 'idb-keyval'

const instances = new Map()

export function useOfflineData(namespace) {
  const prefix = `${namespace}.`

  if (!instances.has(namespace)) {
    const { data: keys, isFinished } = useIDBKeyval(`offline-${namespace}`, [])

    watch(isFinished, async (done) => {
      if (!done) return
      const stored = await allIdbKeys()
      const dataKeys = stored.filter((k) => typeof k === 'string' && k.startsWith(prefix)).map((k) => k.slice(prefix.length))
      const dataSet = new Set(dataKeys)
      const trackedSet = new Set(keys.value)

      if (dataKeys.length !== keys.value.length || dataKeys.some((k) => !trackedSet.has(k)) || keys.value.some((k) => !dataSet.has(k))) {
        keys.value = dataKeys
      }
    })

    instances.set(namespace, { keys, isFinished })
  }

  const { keys, isFinished } = instances.get(namespace)
  const downloadedCount = computed(() => keys.value.length)

  const isDownloaded = (key) => keys.value.includes(String(key))

  async function save(key, data) {
    const k = String(key)
    await set(`${prefix}${k}`, data)
    if (!keys.value.includes(k)) {
      keys.value = [...keys.value, k]
    }
  }

  async function getData(key) {
    return await get(`${prefix}${String(key)}`)
  }

  async function remove(key) {
    const k = String(key)
    await del(`${prefix}${k}`)
    keys.value = keys.value.filter((i) => i !== k)
  }

  async function removeAll() {
    for (const key of keys.value) await del(`${prefix}${key}`)
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
