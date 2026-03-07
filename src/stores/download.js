import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'

import { useQuranService } from '@/services/quranService'
import { useAzkarService } from '@/services/azkarService'
import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'

export const useDownloadStore = defineStore('download', () => {
  const online = useOnline()
  const quranService = useQuranService()
  const azkarService = useAzkarService()

  const downloadQueue = ref([])
  const isDownloading = ref(false)
  const isPaused = ref(false)
  const currentItem = ref(null)

  const allAssets = computed(() => {
    const surahAssets = surahs.map((surah) => ({
      id: `surah-${surah.id}`,
      type: 'surah',
      name: surah.name,
      key: String(surah.id),
      data: surah,
    }))

    const azkarAssets = azkarCategories.map((category) => ({
      id: `azkar-${category.slug}`,
      type: 'azkar',
      name: category.name,
      key: category.slug,
      data: category,
    }))

    return [...surahAssets, ...azkarAssets]
  })

  const totalAssets = computed(() => allAssets.value.length)

  const downloadedCount = computed(
    () => quranService.downloadedCount.value + azkarService.downloadedCount.value,
  )

  const isCompleted = computed(() => downloadedCount.value === totalAssets.value)

  const progressPercentage = computed(() => {
    if (totalAssets.value === 0) return 0
    return Math.round((downloadedCount.value / totalAssets.value) * 100)
  })

  const pendingCount = computed(() => downloadQueue.value.length)

  const isAssetDownloaded = (asset) => {
    return asset.type === 'surah'
      ? quranService.isDownloaded(asset.key)
      : azkarService.isDownloaded(asset.key)
  }

  const isAssetInQueue = (asset) => downloadQueue.value.some((item) => item.id === asset.id)
  const isAssetDownloading = (asset) => currentItem.value?.id === asset.id

  const getAssetStatus = (asset) => {
    if (isAssetDownloaded(asset)) return 'downloaded'
    if (isAssetDownloading(asset)) return 'downloading'
    if (isAssetInQueue(asset)) return 'queued'
    return 'not-downloaded'
  }

  const processQueue = async () => {
    if (isDownloading.value || isPaused.value || downloadQueue.value.length === 0) return

    isDownloading.value = true

    while (downloadQueue.value.length > 0 && !isPaused.value) {
      if (!online.value) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }

      const asset = downloadQueue.value[0]
      currentItem.value = asset

      try {
        if (asset.type === 'surah') {
          await quranService.fetchSurah(asset.data.id)
        } else {
          await azkarService.fetchCategory(asset.data.slug)
        }

        downloadQueue.value.shift()
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to download ${asset.name}:`, error)
        downloadQueue.value.shift()
        downloadQueue.value.push(asset)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    isDownloading.value = false
    currentItem.value = null
  }

  const queueAsset = (asset) => {
    if (!isAssetDownloaded(asset) && !isAssetInQueue(asset)) {
      downloadQueue.value.push(asset)
      processQueue()
    }
  }

  const queueAllAssets = () => {
    const notDownloaded = allAssets.value.filter((a) => !isAssetDownloaded(a) && !isAssetInQueue(a))
    downloadQueue.value.push(...notDownloaded)
    processQueue()
  }

  const removeAsset = async (asset) => {
    if (asset.type === 'surah') {
      await quranService.remove(asset.key)
    } else {
      await azkarService.remove(asset.key)
    }
  }

  const removeAllAssets = async () => {
    await quranService.removeAll()
    await azkarService.removeAll()
  }

  const pauseDownloads = () => {
    isPaused.value = true
  }

  const resumeDownloads = () => {
    isPaused.value = false
    processQueue()
  }

  const cancelAllDownloads = () => {
    downloadQueue.value = []
    isPaused.value = false
  }

  const removeFromQueue = (asset) => {
    const index = downloadQueue.value.findIndex((item) => item.id === asset.id)
    if (index > -1) downloadQueue.value.splice(index, 1)
  }

  return {
    online,
    quranKeys: quranService.keys,
    azkarKeys: azkarService.keys,
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
    isAssetDownloaded,
    isAssetInQueue,
    isAssetDownloading,
    getAssetStatus,
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
