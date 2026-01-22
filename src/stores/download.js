import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage, useOnline } from '@vueuse/core'

import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'

export const useDownloadStore = defineStore('download', () => {
  const online = useOnline()

  // Persisted downloaded data
  const downloadedSurahs = useStorage('downloadedSurahs', {})
  const downloadedAzkar = useStorage('downloadedAzkar', {})

  // Download queue and state
  const downloadQueue = ref([])
  const isDownloading = ref(false)
  const isPaused = ref(false)
  const currentItem = ref(null)
  const currentItemProgress = ref(0)

  // Build list of all assets
  const allAssets = computed(() => {
    const surahAssets = surahs.map((surah) => ({
      id: `surah-${surah.id}`,
      type: 'surah',
      name: surah.name,
      key: surah.id,
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

  // Computed stats
  const totalAssets = computed(() => allAssets.value.length)

  const downloadedCount = computed(() => {
    return Object.keys(downloadedSurahs.value).length + Object.keys(downloadedAzkar.value).length
  })

  const isCompleted = computed(() => downloadedCount.value === totalAssets.value)

  const progressPercentage = computed(() => {
    if (totalAssets.value === 0) return 0
    return Math.round((downloadedCount.value / totalAssets.value) * 100)
  })

  const pendingCount = computed(() => downloadQueue.value.length)

  // Check if an asset is downloaded
  const isAssetDownloaded = (asset) => {
    if (asset.type === 'surah') {
      return !!downloadedSurahs.value[asset.key]
    } else {
      return !!downloadedAzkar.value[asset.key]
    }
  }

  // Check if asset is in queue
  const isAssetInQueue = (asset) => {
    return downloadQueue.value.some((item) => item.id === asset.id)
  }

  // Check if asset is currently downloading
  const isAssetDownloading = (asset) => {
    return currentItem.value?.id === asset.id
  }

  // Get asset status
  const getAssetStatus = (asset) => {
    if (isAssetDownloaded(asset)) return 'downloaded'
    if (isAssetDownloading(asset)) return 'downloading'
    if (isAssetInQueue(asset)) return 'queued'
    return 'not-downloaded'
  }

  // Download a single surah
  const downloadSurah = async (surah) => {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah.id}`)
    if (!response.ok) throw new Error('Failed to fetch surah')
    const json = await response.json()
    downloadedSurahs.value[surah.id] = json
  }

  // Download a single azkar category
  const downloadAzkarCategory = async (category) => {
    const response = await fetch(`/data/azkar/${category.slug}.json`)
    if (!response.ok) throw new Error('Failed to fetch azkar')
    const json = await response.json()
    downloadedAzkar.value[category.slug] = json
  }

  // Process download queue
  const processQueue = async () => {
    if (isDownloading.value || isPaused.value || downloadQueue.value.length === 0) {
      return
    }

    isDownloading.value = true

    while (downloadQueue.value.length > 0 && !isPaused.value) {
      if (!online.value) {
        // Wait for online status
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }

      const asset = downloadQueue.value[0]
      currentItem.value = asset
      currentItemProgress.value = 0

      try {
        if (asset.type === 'surah') {
          await downloadSurah(asset.data)
        } else {
          await downloadAzkarCategory(asset.data)
        }

        // Remove from queue after successful download
        downloadQueue.value.shift()
        currentItemProgress.value = 100

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to download ${asset.name}:`, error)
        // Move failed item to end of queue
        downloadQueue.value.shift()
        downloadQueue.value.push(asset)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    isDownloading.value = false
    currentItem.value = null
    currentItemProgress.value = 0
  }

  // Add single asset to download queue
  const queueAsset = (asset) => {
    if (!isAssetDownloaded(asset) && !isAssetInQueue(asset)) {
      downloadQueue.value.push(asset)
      processQueue()
    }
  }

  // Add all assets to download queue
  const queueAllAssets = () => {
    const notDownloaded = allAssets.value.filter((asset) => !isAssetDownloaded(asset) && !isAssetInQueue(asset))
    downloadQueue.value.push(...notDownloaded)
    processQueue()
  }

  // Remove single asset
  const removeAsset = (asset) => {
    if (asset.type === 'surah') {
      const { [asset.key]: _, ...rest } = downloadedSurahs.value
      downloadedSurahs.value = rest
    } else {
      const { [asset.key]: _, ...rest } = downloadedAzkar.value
      downloadedAzkar.value = rest
    }
  }

  // Remove all downloaded assets
  const removeAllAssets = () => {
    downloadedSurahs.value = {}
    downloadedAzkar.value = {}
  }

  // Pause downloads
  const pauseDownloads = () => {
    isPaused.value = true
  }

  // Resume downloads
  const resumeDownloads = () => {
    isPaused.value = false
    processQueue()
  }

  // Cancel all pending downloads
  const cancelAllDownloads = () => {
    downloadQueue.value = []
    isPaused.value = false
  }

  // Remove asset from queue
  const removeFromQueue = (asset) => {
    const index = downloadQueue.value.findIndex((item) => item.id === asset.id)
    if (index > -1) {
      downloadQueue.value.splice(index, 1)
    }
  }

  return {
    // State
    online,
    downloadedSurahs,
    downloadedAzkar,
    downloadQueue,
    isDownloading,
    isPaused,
    currentItem,
    currentItemProgress,

    // Computed
    allAssets,
    totalAssets,
    downloadedCount,
    isCompleted,
    progressPercentage,
    pendingCount,

    // Methods
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
