<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  IconDownload,
  IconTrash,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
  IconCheck,
  IconLoader2,
  IconWifiOff,
  IconBook2,
  IconSparkles,
  IconCloudDownload,
} from '@tabler/icons-vue'
import { useDownloadStore } from '@/features/downloads/store.js'
import DownloadAssetItem from '@/features/downloads/DownloadAssetItem.vue'
import CircleProgress from '@/shared/ui/CircleProgress.vue'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/shared/utils/arabic'

const downloadStore = useDownloadStore()

const {
  online,
  allAssets,
  totalAssets,
  downloadedCount,
  downloadQueue,
  isCompleted,
  progressPercentage,
  isDownloading,
  isPaused,
  currentItem,
  pendingCount,
} = storeToRefs(downloadStore)

const {
  isDownloaded,
  queueAsset,
  queueAllAssets,
  removeAsset,
  removeAllAssets,
  pauseDownloads,
  resumeDownloads,
  cancelAllDownloads,
  removeFromQueue,
} = downloadStore

const filterType = ref('all')

const assetsWithStatus = computed(() => {
  const queue = downloadQueue.value
  const current = currentItem.value

  return allAssets.value.map((asset) => {
    let status
    if (isDownloaded(asset)) {
      status = 'downloaded'
    } else if (current?.id === asset.id) {
      status = 'downloading'
    } else if (queue.some((item) => item.id === asset.id)) {
      status = 'queued'
    } else {
      status = 'not-downloaded'
    }

    return { ...asset, status }
  })
})

const filteredAssets = computed(() => {
  if (filterType.value === 'all') return assetsWithStatus.value
  return assetsWithStatus.value.filter((asset) => asset.type === filterType.value)
})

const surahCount = computed(() => 114)
const azkarCount = computed(() => allAssets.value.length - 114)

const handleDownloadAll = () => {
  queueAllAssets()
}

const handleRemoveAll = () => {
  cancelAllDownloads()

  toast.warning('سيتم حذف جميع الملفات، متأكد؟', {
    position: 'bottom-center',
    duration: Infinity,
    action: {
      label: 'تأكيد الحذف',
      onClick: () => removeAllAssets(),
    },
  })
}

const handleAssetAction = (asset) => {
  if (asset.status === 'downloaded') {
    removeAsset(asset)
  } else if (asset.status === 'queued') {
    removeFromQueue(asset)
  } else if (asset.status === 'not-downloaded') {
    queueAsset(asset)
  }
}
</script>

<template>
  <div class="download-manager">
    <!-- Header -->
    <div class="dm-header">
      <div class="dm-header-content">
        <div class="dm-title">
          <span class="dm-title-icon">
            <IconCloudDownload :size="20" />
          </span>
          <div>
            <h3>التنزيلات</h3>
            <p>للاستخدام بدون إنترنت</p>
          </div>
        </div>

        <div class="dm-stats">
          <div class="dm-stats-text">
            <span class="dm-stats-count"
              >{{ toArabicNumerals(downloadedCount) }}/{{ toArabicNumerals(totalAssets) }}</span
            >
            <span class="dm-stats-label">ملف محمّل</span>
          </div>
          <CircleProgress class="d-none d-md-block" :percentage="progressPercentage" />
        </div>
      </div>

      <!-- Status Bar -->
      <div v-if="isDownloading || isPaused || !online" class="dm-status-bar">
        <template v-if="!online">
          <IconWifiOff :size="16" />
          <span>لا يوجد اتصال بالإنترنت</span>
        </template>
        <template v-else-if="isDownloading && currentItem">
          <IconLoader2 :size="16" class="spin" />
          <span>جاري تحميل: {{ currentItem.name }}</span>
          <span class="dm-status-remaining">{{ toArabicNumerals(pendingCount) }} متبقي</span>
        </template>
        <template v-else-if="isPaused">
          <IconPlayerPause :size="16" />
          <span>التحميل متوقف مؤقتاً</span>
        </template>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="dm-toolbar">
      <div class="dm-filters">
        <button class="dm-filter-btn" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">
          الكل
          <span class="dm-filter-count">{{ toArabicNumerals(totalAssets) }}</span>
        </button>
        <button class="dm-filter-btn" :class="{ active: filterType === 'surah' }" @click="filterType = 'surah'">
          <IconBook2 :size="14" />
          السور
          <span class="dm-filter-count">{{ toArabicNumerals(surahCount) }}</span>
        </button>
        <button class="dm-filter-btn" :class="{ active: filterType === 'azkar' }" @click="filterType = 'azkar'">
          <IconSparkles :size="14" />
          الأذكار
          <span class="dm-filter-count">{{ toArabicNumerals(azkarCount) }}</span>
        </button>
      </div>

      <div class="dm-actions">
        <button
          v-if="isDownloading || isPaused"
          class="dm-action-btn"
          @click="isPaused ? resumeDownloads() : pauseDownloads()"
        >
          <component :is="isPaused ? IconPlayerPlay : IconPlayerPause" :size="16" />
        </button>

        <button v-if="pendingCount > 0" class="dm-action-btn" @click="cancelAllDownloads" title="إلغاء">
          <IconX :size="16" />
        </button>

        <button
          class="dm-action-btn danger"
          @click="handleRemoveAll"
          :disabled="isDownloading || downloadedCount === 0"
          title="حذف الكل"
        >
          <IconTrash :size="16" />
        </button>

        <button
          class="dm-action-btn primary"
          @click="handleDownloadAll"
          :disabled="isDownloading || !online || isCompleted"
        >
          <IconDownload :size="16" />
          <span>تحميل الكل</span>
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="dm-list">
      <DownloadAssetItem
        v-for="asset in filteredAssets"
        :key="asset.id"
        :asset="asset"
        :online="online"
        @action="handleAssetAction"
      />
    </div>

    <!-- Completed Banner -->
    <div v-if="isCompleted" class="dm-completed">
      <IconCheck :size="20" />
      <span>تم تحميل جميع الملفات بنجاح!</span>
    </div>
  </div>
</template>

<style scoped>
.download-manager {
  background: var(--bs-card-bg, var(--bs-body-bg));
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;
  contain: layout style;
}

/* Header */
.dm-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.dm-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.dm-title {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.dm-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: color-mix(in srgb, var(--bs-primary) 12%, transparent);
  color: var(--bs-primary);
}

.dm-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.dm-title p {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
}

.dm-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dm-stats-text {
  display: flex;
  flex-direction: column;
  text-align: start;
}

.dm-stats-count {
  font-size: 1.25rem;
  font-weight: 700;
}

.dm-stats-label {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

/* Status Bar */
.dm-status-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  background: color-mix(in srgb, var(--bs-primary) 10%, transparent);
  color: var(--bs-body-color);
  border-radius: 8px;
  font-size: 0.8rem;
  overflow: hidden;
  min-width: 0;
}

.dm-status-bar > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.dm-status-remaining {
  margin-inline-start: auto;
  opacity: 0.7;
}

/* Toolbar */
.dm-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bs-border-color);
  flex-wrap: wrap;
}

.dm-filters {
  display: flex;
  gap: 0.25rem;
}

.dm-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--bs-secondary-color);
  font-size: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.dm-filter-btn:hover {
  background: rgba(var(--bs-secondary-rgb), 0.1);
}

.dm-filter-btn.active {
  background: var(--bs-primary);
  color: white;
}

.dm-filter-count {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.dm-filter-btn.active .dm-filter-count {
  background: rgba(255, 255, 255, 0.2);
}

.dm-actions {
  display: flex;
  gap: 0.5rem;
}

.dm-action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  font-size: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}

.dm-action-btn:hover:not(:disabled) {
  background: rgba(var(--bs-secondary-rgb), 0.1);
}

.dm-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dm-action-btn.primary {
  background: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.dm-action-btn.primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--bs-primary) 85%, #000);
}

.dm-action-btn.danger:hover:not(:disabled) {
  background: var(--bs-danger);
  border-color: var(--bs-danger);
  color: white;
}

/* List */
.dm-list {
  max-height: 300px;
  overflow-y: auto;
}

/* Completed Banner */
.dm-completed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bs-success);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Animations */
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

/* Scrollbar */
.dm-list::-webkit-scrollbar {
  width: 6px;
}

.dm-list::-webkit-scrollbar-track {
  background: transparent;
}

.dm-list::-webkit-scrollbar-thumb {
  background: var(--bs-border-color);
  border-radius: 3px;
}

.dm-list::-webkit-scrollbar-thumb:hover {
  background: var(--bs-secondary-color);
}
</style>
