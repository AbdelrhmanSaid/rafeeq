import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'

import { useQuranService } from '@/services/quranService'
import { useAzkarService } from '@/services/azkarService'
import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'
import { sleep } from '@/utilities/async'

export const useDownloadStore = defineStore('download', () => {
  const online = useOnline()
  const quranService = useQuranService()
  const azkarService = useAzkarService()

  const downloadQueue = ref([])
  const isDownloading = ref(false)
  const isPaused = ref(false)
  const currentItem = ref(null)

  function serviceFor(asset) {
    return asset.type === 'surah' ? quranService : azkarService
  }

  const allAssets = computed(() => [
    ...surahs.map((s) => ({
      id: `surah-${s.id}`,
      type: 'surah',
      name: s.name,
      key: String(s.id),
      data: s,
    })),
    ...azkarCategories.map((c) => ({
      id: `azkar-${c.slug}`,
      type: 'azkar',
      name: c.name,
      key: c.slug,
      data: c,
    })),
  ])

  const totalAssets = computed(() => allAssets.value.length)
  const downloadedCount = computed(() => quranService.downloadedCount.value + azkarService.downloadedCount.value)
  const isCompleted = computed(() => downloadedCount.value === totalAssets.value)
  const progressPercentage = computed(() =>
    totalAssets.value === 0 ? 0 : Math.round((downloadedCount.value / totalAssets.value) * 100),
  )
  const pendingCount = computed(() => downloadQueue.value.length)

  function isDownloaded(asset) {
    return serviceFor(asset).isDownloaded(asset.key)
  }

  function isInQueue(asset) {
    return downloadQueue.value.some((item) => item.id === asset.id)
  }

  async function fetchAsset(asset) {
    if (asset.type === 'surah') {
      await quranService.fetchSurah(asset.data.id)
    } else {
      await azkarService.fetchCategory(asset.data.slug)
    }
  }

  async function processQueue() {
    if (isDownloading.value || isPaused.value || downloadQueue.value.length === 0) return

    isDownloading.value = true

    while (downloadQueue.value.length > 0 && !isPaused.value) {
      if (!online.value) {
        await sleep(1000)
        continue
      }

      const asset = downloadQueue.value[0]
      currentItem.value = asset

      try {
        await fetchAsset(asset)
        downloadQueue.value.shift()
        await sleep(100)
      } catch (error) {
        console.error(`Failed to download ${asset.name}:`, error)
        downloadQueue.value.shift()
        downloadQueue.value.push(asset)
        await sleep(1000)
      }
    }

    isDownloading.value = false
    currentItem.value = null
  }

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
    await serviceFor(asset).remove(asset.key)
  }

  async function removeAllAssets() {
    await quranService.removeAll()
    await azkarService.removeAll()
  }

  function pauseDownloads() {
    isPaused.value = true
  }

  function resumeDownloads() {
    isPaused.value = false
    processQueue()
  }

  function cancelAllDownloads() {
    downloadQueue.value = []
    isPaused.value = false
  }

  function removeFromQueue(asset) {
    const index = downloadQueue.value.findIndex((item) => item.id === asset.id)
    if (index > -1) downloadQueue.value.splice(index, 1)
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
