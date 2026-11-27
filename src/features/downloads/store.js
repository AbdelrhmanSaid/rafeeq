import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'
import { delMany, keys as idbKeys } from 'idb-keyval'

import { useOfflineData } from '@/shared/offline/useOfflineData'
import { mushafDownloads, scanStoredPages } from '@/features/quran/lib/mushafStorage'
import { fetchCategory } from '@/features/azkar/api'
import { progressPercent } from '@/features/downloads/lib/progress'
import surahs from '@/features/quran/data/surahs.js'
import azkarCategories from '@/features/azkar/data/categories.js'
import { sleep } from '@/features/downloads/lib/sleep'
import { toast } from 'vue-sonner'

export const useDownloadStore = defineStore('download', () => {
  const online = useOnline()

  const azkarOffline = useOfflineData('azkar')

  const assetTypes = {
    surah: {
      offline: mushafDownloads,
      assets: surahs.map((s) => ({ id: `surah-${s.id}`, type: 'surah', name: s.name, key: String(s.id) })),
      fetch: (asset, signal) => mushafDownloads.download(asset.key, { signal }),
      discard: (asset) => mushafDownloads.discard(asset.key),
    },
    azkar: {
      offline: azkarOffline,
      assets: azkarCategories.map((c) => ({ id: `azkar-${c.slug}`, type: 'azkar', name: c.name, key: c.slug })),
      fetch: async (asset, signal) => {
        await fetchCategory(asset.key)
        signal.throwIfAborted()
      },
      discard: (asset) => azkarOffline.remove(asset.key),
    },
  }
  const types = Object.values(assetTypes)

  const downloadQueue = ref([])
  const isDownloading = ref(false)
  const isPaused = ref(false)
  const currentItem = ref(null)

  const allAssets = computed(() => types.flatMap((t) => t.assets))

  const totalAssets = computed(() => allAssets.value.length)
  const downloadedCount = computed(() => types.reduce((sum, t) => sum + t.offline.downloadedCount.value, 0))
  const isCompleted = computed(() => downloadedCount.value === totalAssets.value)
  const progressPercentage = computed(() => progressPercent(downloadedCount.value, totalAssets.value))
  const pendingCount = computed(() => downloadQueue.value.length)

  function isDownloaded(asset) {
    return assetTypes[asset.type].offline.isDownloaded(asset.key)
  }

  function isInQueue(asset) {
    return downloadQueue.value.some((item) => item.id === asset.id)
  }

  let active = null
  const started = new Map()

  const failures = new Map()

  async function processQueue() {
    let failed = false
    if (isDownloading.value || isPaused.value || downloadQueue.value.length === 0) return

    isDownloading.value = true

    while (downloadQueue.value.length > 0 && !isPaused.value) {
      if (!online.value) {
        currentItem.value = null
        await sleep(1000)
        continue
      }

      const asset = downloadQueue.value[0]
      const controller = new AbortController()
      const run = assetTypes[asset.type].fetch(asset, controller.signal)
      active = { asset, controller, run: run.catch(() => {}) }
      currentItem.value = asset
      started.set(asset.id, asset)

      // Removed by id, not index: the queue may have been cancelled or refilled meanwhile.
      try {
        await run
        started.delete(asset.id)
        dropFromQueue(asset)
        await sleep(100)
      } catch (error) {
        currentItem.value = null
        if (controller.signal.aborted) continue
        console.error(`Failed to download ${asset.name}:`, error)
        if (!isInQueue(asset)) continue
        if (!online.value) continue
        dropFromQueue(asset)
        // Three tries, not forever: a full disk would never succeed.
        const tries = (failures.get(asset.id) ?? 0) + 1
        failures.set(asset.id, tries)
        if (tries < 3) downloadQueue.value.push(asset)
        else failed = true
        await sleep(1000)
      } finally {
        if (active?.controller === controller) active = null
      }
    }

    isDownloading.value = false
    currentItem.value = null
    failures.clear()
    if (failed) toast.error('تعذر تحميل بعض الملفات، تأكد من الاتصال ومساحة التخزين ثم حاول مرة أخرى')
  }

  async function stopActive(assets) {
    if (!active || !assets.some((asset) => asset.id === active.asset.id)) return
    active.controller.abort()
    await active.run
  }

  async function discard(assets) {
    const ids = new Set(assets.map((asset) => asset.id))
    const cancelled = [...started.values()].filter((asset) => ids.has(asset.id))
    for (const asset of cancelled) started.delete(asset.id)
    await Promise.all(cancelled.map((asset) => assetTypes[asset.type].discard(asset)))
  }

  // Migration: surahs saved by the old reader as text the Mushaf can't draw are downloaded again as pages.
  async function replaceOldSurahDownloads() {
    await scanStoredPages()
    // Surahs recorded as downloaded whose pages are gone (replaced by the V4 fonts) are queued again.
    const missing = new Set(mushafDownloads.missing().map(String))
    if (missing.size) {
      downloadQueue.value.push(...assetTypes.surah.assets.filter((a) => missing.has(a.key) && !isInQueue(a)))
      processQueue()
    }
    const old = (await idbKeys()).filter((key) => key === 'offline-quran' || String(key).startsWith('quran.'))
    if (!old.length) return
    const ids = new Set(old.filter((key) => key !== 'offline-quran').map((key) => String(key).slice('quran.'.length)))
    downloadQueue.value.push(
      ...assetTypes.surah.assets.filter((a) => ids.has(a.key) && !isDownloaded(a) && !isInQueue(a)),
    )
    processQueue()
    await delMany(old)
  }
  replaceOldSurahDownloads().catch(() => {})

  function queueAsset(asset) {
    if (!isDownloaded(asset) && !isInQueue(asset)) {
      downloadQueue.value.push(asset)
      processQueue()
    }
  }

  function queueAllAssets() {
    const pending = allAssets.value.filter((a) => !isDownloaded(a) && !isInQueue(a))
    downloadQueue.value.push(...pending)
    processQueue()
  }

  async function removeAsset(asset) {
    await removeFromQueue(asset)
    await assetTypes[asset.type].offline.remove(asset.key)
  }

  // A download still running would store its item again after the removal, so the queue is cancelled first.
  async function removeAllAssets() {
    await cancelAllDownloads()
    await Promise.all(types.map((t) => t.offline.removeAll()))
  }

  function pauseDownloads() {
    isPaused.value = true
    active?.controller.abort()
  }

  function resumeDownloads() {
    isPaused.value = false
    processQueue()
  }

  async function cancelAllDownloads() {
    const cancelled = [...downloadQueue.value, ...started.values()]
    downloadQueue.value = []
    isPaused.value = false
    await stopActive(cancelled)
    await discard(cancelled)
  }

  function dropFromQueue(asset) {
    const index = downloadQueue.value.findIndex((item) => item.id === asset.id)
    if (index > -1) downloadQueue.value.splice(index, 1)
  }

  async function removeFromQueue(asset) {
    dropFromQueue(asset)
    await stopActive([asset])
    await discard([asset])
  }

  return {
    online,
    downloadQueue,
    isDownloading,
    isPaused,
    currentItem,
    allAssets,
    totalAssets,
    downloadedCount,
    isCompleted,
    progressPercentage,
    pendingCount,
    isDownloaded,
    queueAsset,
    queueAllAssets,
    removeAsset,
    removeAllAssets,
    pauseDownloads,
    resumeDownloads,
    cancelAllDownloads,
    removeFromQueue,
  }
})
