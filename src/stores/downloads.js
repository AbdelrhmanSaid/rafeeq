import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useFetch, useStorage } from '@vueuse/core'

import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const useDownloadsStore = defineStore('downloads', () => {
  const downloadedSurahs = useStorage('downloadedSurahs', {})
  const downloadedAzkar = useStorage('downloadedAzkar', {})

  const downloadState = ref({
    isDownloading: false,
    currentItem: null,
    progress: 0,
    completed: 0,
  })

  const totalAssets = computed(() => surahs.length + azkarCategories.length)
  const alreadyDownloadedCount = computed(() => {
    return Object.keys(downloadedSurahs.value).length + Object.keys(downloadedAzkar.value).length
  })
  const progressPercentage = computed(() => Math.round(downloadState.value.progress))
  const isCompleted = computed(() => alreadyDownloadedCount.value === totalAssets.value)
  const hasPartialDownloads = computed(() => alreadyDownloadedCount.value > 0 && !isCompleted.value)

  const updateProgress = () => {
    downloadState.value.completed = alreadyDownloadedCount.value
    downloadState.value.progress = totalAssets.value
      ? (downloadState.value.completed / totalAssets.value) * 100
      : 0
  }

  watch([downloadedSurahs, downloadedAzkar], updateProgress, { deep: true, immediate: true })

  const downloadSurah = async (surah) => {
    downloadState.value.currentItem = `${surah.name || surah.id}`
    const { data, error } = await useFetch(`https://api.alquran.cloud/v1/surah/${surah.id}`).json()
    if (error.value) {
      throw error.value
    }
    downloadedSurahs.value[surah.id] = data.value
  }

  const downloadAzkarCategory = async (category) => {
    downloadState.value.currentItem = `${category.name || category.slug}`
    const { data, error } = await useFetch(`/data/azkar/${category.slug}.json`).json()
    if (error.value) {
      throw error.value
    }
    downloadedAzkar.value[category.slug] = data.value
  }

  const downloadAllAssets = async () => {
    if (downloadState.value.isDownloading) {
      return
    }

    downloadState.value.isDownloading = true

    try {
      const surahsToDownload = surahs.filter((surah) => !downloadedSurahs.value[surah.id])
      for (const surah of surahsToDownload) {
        await downloadSurah(surah)
        updateProgress()
        await delay(100)
      }

      const azkarToDownload = azkarCategories.filter((category) => !downloadedAzkar.value[category.slug])
      for (const category of azkarToDownload) {
        await downloadAzkarCategory(category)
        updateProgress()
        await delay(100)
      }
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      downloadState.value.isDownloading = false
      downloadState.value.currentItem = null
    }
  }

  const clearAllDownloads = () => {
    downloadedSurahs.value = {}
    downloadedAzkar.value = {}
    updateProgress()
  }

  return {
    downloadedSurahs,
    downloadedAzkar,
    downloadState,
    totalAssets,
    alreadyDownloadedCount,
    progressPercentage,
    isCompleted,
    hasPartialDownloads,
    downloadAllAssets,
    clearAllDownloads,
  }
})
