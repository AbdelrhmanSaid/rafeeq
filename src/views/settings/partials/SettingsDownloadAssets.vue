<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useFetch, useOnline, useStorage } from '@vueuse/core'
import { IconDownload, IconCheck, IconLoader2, IconX, IconAlertTriangle, IconWifi, IconWifiOff } from '@tabler/icons-vue'

import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'

// Storage with validation
const downloadedSurahs = useStorage('downloadedSurahs', {}, localStorage, {
  serializer: {
    read: (value) => {
      try {
        return JSON.parse(value)
      } catch {
        return {}
      }
    },
    write: (value) => JSON.stringify(value)
  }
})

const downloadedAzkar = useStorage('downloadedAzkar', {}, localStorage, {
  serializer: {
    read: (value) => {
      try {
        return JSON.parse(value)
      } catch {
        return {}
      }
    },
    write: (value) => JSON.stringify(value)
  }
})

// Network status
const isOnline = useOnline()

// Download state management
const downloadState = ref({
  isDownloading: false,
  isPaused: false,
  isCancelled: false,
  currentItem: null,
  progress: 0,
  completed: 0,
  failed: 0,
  retryCount: 0,
  errors: []
})

// Configuration
const config = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  batchSize: 5,
  minStorageSpace: 50 * 1024 * 1024 // 50MB minimum required space
}

const totalAssets = computed(() => surahs.length + azkarCategories.length)

// Calculate already downloaded assets with validation
const alreadyDownloadedCount = computed(() => {
  const validSurahs = Object.keys(downloadedSurahs.value).filter(id => {
    const surah = downloadedSurahs.value[id]
    return surah && surah.data && Array.isArray(surah.data.ayahs)
  })
  
  const validAzkar = Object.keys(downloadedAzkar.value).filter(id => {
    const azkar = downloadedAzkar.value[id]
    return azkar && Array.isArray(azkar.data || azkar)
  })
  
  return validSurahs.length + validAzkar.length
})

const progressPercentage = computed(() => Math.round(downloadState.value.progress))
const isCompleted = computed(() => alreadyDownloadedCount.value === totalAssets.value)
const hasPartialDownloads = computed(() => alreadyDownloadedCount.value > 0 && !isCompleted.value)
const hasErrors = computed(() => downloadState.value.errors.length > 0)

// Storage management
const checkStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const available = estimate.quota - estimate.usage
      return available > config.minStorageSpace
    } catch (error) {
      console.warn('Could not check storage quota:', error)
      return true // Assume it's fine if we can't check
    }
  }
  return true
}

const validateDownloadedData = (data, type) => {
  if (!data) return false
  
  if (type === 'surah') {
    return data.data && Array.isArray(data.data.ayahs) && data.data.ayahs.length > 0
  } else if (type === 'azkar') {
    const azkarData = data.data || data
    return Array.isArray(azkarData) && azkarData.length > 0
  }
  
  return false
}

// Network utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchWithRetry = async (url, retries = config.maxRetries) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (!isOnline.value) {
        throw new Error('No internet connection')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout)
      
      const response = await useFetch(url, {
        signal: controller.signal
      }).json()
      
      clearTimeout(timeoutId)
      const data = await response.get()
      
      if (!data) {
        throw new Error('No data received')
      }
      
      return data
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      
      // Exponential backoff
      const delayTime = config.retryDelay * Math.pow(2, attempt)
      await delay(delayTime)
      
      downloadState.value.retryCount++
    }
  }
}

// Download individual surah
const downloadSurah = async (surah) => {
  if (downloadState.value.isCancelled) return false
  
  downloadState.value.currentItem = `سورة ${surah.name || surah.id}`
  
  try {
    const data = await fetchWithRetry(`https://api.alquran.cloud/v1/surah/${surah.id}`)
    
    if (!validateDownloadedData(data, 'surah')) {
      throw new Error('Invalid surah data received')
    }
    
    downloadedSurahs.value[surah.id] = {
      ...data.data,
      downloadedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    return true
  } catch (error) {
    const errorMsg = `فشل في تحميل سورة ${surah.name || surah.id}: ${error.message}`
    downloadState.value.errors.push(errorMsg)
    console.error(errorMsg, error)
    return false
  }
}

// Download individual azkar category
const downloadAzkarCategory = async (category) => {
  if (downloadState.value.isCancelled) return false
  
  downloadState.value.currentItem = `${category.name || category.id}`
  
  try {
    const data = await fetchWithRetry(`/data/azkar/${category.id}.json`)
    
    if (!validateDownloadedData(data, 'azkar')) {
      throw new Error('Invalid azkar data received')
    }
    
    downloadedAzkar.value[category.id] = {
      ...data,
      downloadedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    return true
  } catch (error) {
    const errorMsg = `فشل في تحميل ${category.name || category.id}: ${error.message}`
    downloadState.value.errors.push(errorMsg)
    console.error(errorMsg, error)
    return false
  }
}

// Update progress
const updateProgress = () => {
  const completed = downloadState.value.completed
  downloadState.value.progress = (completed / totalAssets.value) * 100
}

// Main download function
const downloadAllAssets = async () => {
  if (!isOnline.value) {
    downloadState.value.errors.push('لا يوجد اتصال بالإنترنت')
    return
  }
  
  // Check storage space
  const hasSpace = await checkStorageQuota()
  if (!hasSpace) {
    downloadState.value.errors.push('مساحة التخزين غير كافية')
    return
  }
  
  // Reset state
  downloadState.value = {
    isDownloading: true,
    isPaused: false,
    isCancelled: false,
    currentItem: null,
    progress: 0,
    completed: alreadyDownloadedCount.value,
    failed: 0,
    retryCount: 0,
    errors: []
  }
  
  try {
    // Download surahs
    const surahsToDownload = surahs.filter(surah => !downloadedSurahs.value[surah.id])
    
    for (const surah of surahsToDownload) {
      if (downloadState.value.isCancelled) break
      
      const success = await downloadSurah(surah)
      if (success) {
        downloadState.value.completed++
      } else {
        downloadState.value.failed++
      }
      
      updateProgress()
      
      // Small delay to prevent overwhelming the API
      await delay(100)
    }
    
    // Download azkar categories
    const azkarToDownload = azkarCategories.filter(category => !downloadedAzkar.value[category.id])
    
    for (const category of azkarToDownload) {
      if (downloadState.value.isCancelled) break
      
      const success = await downloadAzkarCategory(category)
      if (success) {
        downloadState.value.completed++
      } else {
        downloadState.value.failed++
      }
      
      updateProgress()
      
      // Small delay to prevent overwhelming the server
      await delay(100)
    }
    
  } catch (error) {
    console.error('Download process failed:', error)
    downloadState.value.errors.push('فشل في عملية التحميل: ' + error.message)
  } finally {
    downloadState.value.isDownloading = false
    downloadState.value.currentItem = null
  }
}

// Cancel download
const cancelDownload = () => {
  downloadState.value.isCancelled = true
  downloadState.value.isDownloading = false
  downloadState.value.currentItem = null
}

// Clear all downloads with confirmation
const clearAllDownloads = () => {
  if (confirm('هل أنت متأكد من حذف جميع التنزيلات؟')) {
    try {
      downloadedSurahs.value = {}
      downloadedAzkar.value = {}
      downloadState.value.completed = 0
      downloadState.value.progress = 0
      downloadState.value.errors = []
    } catch (error) {
      console.error('Failed to clear downloads:', error)
      downloadState.value.errors.push('فشل في حذف التنزيلات')
    }
  }
}

// Clear specific errors
const clearErrors = () => {
  downloadState.value.errors = []
}

// Clean up invalid downloads
const cleanupInvalidDownloads = () => {
  // Clean invalid surahs
  Object.keys(downloadedSurahs.value).forEach(id => {
    if (!validateDownloadedData(downloadedSurahs.value[id], 'surah')) {
      delete downloadedSurahs.value[id]
    }
  })
  
  // Clean invalid azkar
  Object.keys(downloadedAzkar.value).forEach(id => {
    if (!validateDownloadedData(downloadedAzkar.value[id], 'azkar')) {
      delete downloadedAzkar.value[id]
    }
  })
}

// Initialize on mount
onMounted(async () => {
  cleanupInvalidDownloads()
  downloadState.value.completed = alreadyDownloadedCount.value
  downloadState.value.progress = (downloadState.value.completed / totalAssets.value) * 100
})

// Computed properties for UI states
const downloadButtonText = computed(() => {
  if (downloadState.value.isDownloading) return 'جاري التحميل...'
  if (isCompleted.value) return 'تم التحميل بالكامل'
  if (hasPartialDownloads.value) return 'استكمال التحميل'
  return 'بدء التحميل'
})

const downloadButtonIcon = computed(() => {
  if (downloadState.value.isDownloading) return IconLoader2
  if (isCompleted.value) return IconCheck
  return IconDownload
})

const connectionStatus = computed(() => ({
  icon: isOnline.value ? IconWifi : IconWifiOff,
  text: isOnline.value ? 'متصل' : 'غير متصل',
  class: isOnline.value ? 'text-success' : 'text-danger'
}))
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="card-title mb-0">تحميل جميع الملفات</h6>
        <div class="d-flex align-items-center gap-2" :class="connectionStatus.class">
          <component :is="connectionStatus.icon" size="1rem" />
          <small>{{ connectionStatus.text }}</small>
        </div>
      </div>
      
      <p class="card-text text-muted mb-3">
        تحميل جميع سور القرآن الكريم وملفات الأذكار للاستخدام دون اتصال بالإنترنت
      </p>

      <!-- Current Storage Status -->
      <div class="mb-3 p-3 bg-light rounded">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-medium">حالة التخزين الحالية:</span>
          <span class="badge" :class="isCompleted ? 'bg-success' : hasPartialDownloads ? 'bg-warning' : 'bg-secondary'">
            {{ alreadyDownloadedCount }}/{{ totalAssets }}
          </span>
        </div>
        <div class="progress mb-2" style="height: 6px;">
          <div 
            class="progress-bar" 
            :class="isCompleted ? 'bg-success' : hasPartialDownloads ? 'bg-warning' : 'bg-secondary'"
            role="progressbar" 
            :style="{ width: progressPercentage + '%' }"
            :aria-valuenow="progressPercentage" 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        <div class="row text-center">
          <div class="col-6">
            <small class="text-muted d-block">سور القرآن</small>
            <strong>{{ Object.keys(downloadedSurahs).length }}/{{ surahs.length }}</strong>
          </div>
          <div class="col-6">
            <small class="text-muted d-block">فئات الأذكار</small>
            <strong>{{ Object.keys(downloadedAzkar).length }}/{{ azkarCategories.length }}</strong>
          </div>
        </div>
      </div>

      <!-- Current Download Status -->
      <div v-if="downloadState.isDownloading" class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small class="text-muted">
            {{ downloadState.currentItem || 'جاري التحميل...' }}
          </small>
          <div class="d-flex gap-2">
            <small class="text-muted">{{ downloadState.completed }}/{{ totalAssets }}</small>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-danger"
              @click="cancelDownload"
              title="إلغاء التحميل"
            >
              <IconX size="0.875rem" />
            </button>
          </div>
        </div>
        <div class="progress" style="height: 8px;">
          <div 
            class="progress-bar progress-bar-striped progress-bar-animated" 
            role="progressbar" 
            :style="{ width: progressPercentage + '%' }"
            :aria-valuenow="progressPercentage" 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <small class="text-muted">{{ progressPercentage }}%</small>
          <small v-if="downloadState.retryCount > 0" class="text-warning">
            إعادة المحاولة: {{ downloadState.retryCount }}
          </small>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="hasErrors" class="alert alert-danger" role="alert">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <IconAlertTriangle size="1.25rem" class="me-2" />
            <strong>حدثت أخطاء أثناء التحميل:</strong>
          </div>
          <button 
            type="button" 
            class="btn btn-sm btn-outline-danger"
            @click="clearErrors"
            title="مسح الأخطاء"
          >
            <IconX size="0.875rem" />
          </button>
        </div>
        <ul class="mt-2 mb-0">
          <li v-for="error in downloadState.errors.slice(-5)" :key="error" class="small">
            {{ error }}
          </li>
          <li v-if="downloadState.errors.length > 5" class="small text-muted">
            و {{ downloadState.errors.length - 5 }} أخطاء أخرى...
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2 flex-wrap">
        <button 
          type="button" 
          class="btn btn-primary d-flex align-items-center gap-2"
          @click="downloadAllAssets"
          :disabled="downloadState.isDownloading || !isOnline"
        >
          <component 
            :is="downloadButtonIcon" 
            size="1.25rem" 
            :class="{ 'spin': downloadState.isDownloading }" 
          />
          <span>{{ downloadButtonText }}</span>
        </button>

        <button 
          v-if="alreadyDownloadedCount > 0" 
          type="button" 
          class="btn btn-outline-danger d-flex align-items-center gap-2"
          @click="clearAllDownloads"
          :disabled="downloadState.isDownloading"
        >
          <IconX size="1.25rem" />
          <span>مسح جميع التنزيلات</span>
        </button>

        <button 
          type="button" 
          class="btn btn-outline-secondary d-flex align-items-center gap-2"
          @click="cleanupInvalidDownloads"
          :disabled="downloadState.isDownloading"
          title="تنظيف التنزيلات التالفة"
        >
          <IconCheck size="1.25rem" />
          <span>تنظيف</span>
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="isCompleted && !downloadState.isDownloading" class="alert alert-success mt-3 mb-0">
        <IconCheck size="1.25rem" class="me-2" />
        تم تحميل جميع الملفات بنجاح! يمكنك الآن استخدام التطبيق دون اتصال بالإنترنت.
      </div>

      <!-- Offline Warning -->
      <div v-if="!isOnline" class="alert alert-warning mt-3 mb-0">
        <IconWifiOff size="1.25rem" class="me-2" />
        لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال للمتابعة.
      </div>

      <!-- Statistics -->
      <div v-if="downloadState.failed > 0 || downloadState.retryCount > 0" class="mt-3">
        <small class="text-muted d-block">
          إحصائيات التحميل:
          <span v-if="downloadState.failed > 0" class="text-danger">
            فشل: {{ downloadState.failed }}
          </span>
          <span v-if="downloadState.retryCount > 0" class="text-warning ms-2">
            إعادة المحاولة: {{ downloadState.retryCount }}
          </span>
        </small>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.progress {
  border-radius: 1rem;
  overflow: hidden;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.btn-sm {
  --bs-btn-padding-y: 0.125rem;
  --bs-btn-padding-x: 0.5rem;
  --bs-btn-font-size: 0.75rem;
}
</style> 