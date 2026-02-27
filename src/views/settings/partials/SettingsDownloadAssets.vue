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
import { useDownloadStore } from '@/stores/download.js'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/utilities/arabic'

const downloadStore = useDownloadStore()

const {
  online,
  allAssets,
  totalAssets,
  downloadedCount,
  downloadedSurahs,
  downloadedAzkar,
  downloadQueue,
  isCompleted,
  progressPercentage,
  isDownloading,
  isPaused,
  currentItem,
  pendingCount,
} = storeToRefs(downloadStore)

const {
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

// Pre-compute status for all assets to avoid repeated lookups
const assetsWithStatus = computed(() => {
  const downloaded = downloadedSurahs.value
  const downloadedAz = downloadedAzkar.value
  const queue = downloadQueue.value
  const current = currentItem.value

  return allAssets.value.map((asset) => {
    let status
    if (asset.type === 'surah') {
      status = downloaded[asset.key] ? 'downloaded' : null
    } else {
      status = downloadedAz[asset.key] ? 'downloaded' : null
    }

    if (!status) {
      if (current?.id === asset.id) {
        status = 'downloading'
      } else if (queue.some((item) => item.id === asset.id)) {
        status = 'queued'
      } else {
        status = 'not-downloaded'
      }
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
          <IconCloudDownload class="dm-title-icon" />
          <div>
            <h3>التنزيلات</h3>
            <p>للاستخدام بدون إنترنت</p>
          </div>
        </div>

        <div class="dm-stats">
          <div class="d-none d-md-block dm-progress-ring">
            <svg viewBox="0 0 36 36">
              <circle class="ring-bg" cx="18" cy="18" r="15.9155" />
              <circle
                class="ring-fill"
                cx="18"
                cy="18"
                r="15.9155"
                :stroke-dasharray="`${progressPercentage} 100`"
              />
            </svg>
            <span class="ring-text">{{ toArabicNumerals(progressPercentage) }}%</span>
          </div>
          <div class="dm-stats-text">
            <span class="dm-stats-count">{{ toArabicNumerals(downloadedCount) }}/{{ toArabicNumerals(totalAssets) }}</span>
            <span class="dm-stats-label">ملف محمّل</span>
          </div>
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
        <button
          class="dm-filter-btn"
          :class="{ active: filterType === 'all' }"
          @click="filterType = 'all'"
        >
          الكل
          <span class="dm-filter-count">{{ toArabicNumerals(totalAssets) }}</span>
        </button>
        <button
          class="dm-filter-btn"
          :class="{ active: filterType === 'surah' }"
          @click="filterType = 'surah'"
        >
          <IconBook2 :size="14" />
          السور
          <span class="dm-filter-count">{{ toArabicNumerals(surahCount) }}</span>
        </button>
        <button
          class="dm-filter-btn"
          :class="{ active: filterType === 'azkar' }"
          @click="filterType = 'azkar'"
        >
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

        <button
          v-if="pendingCount > 0"
          class="dm-action-btn"
          @click="cancelAllDownloads"
          title="إلغاء"
        >
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
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="dm-item"
        :class="asset.status"
      >
        <div class="dm-item-icon" :class="asset.type">
          <IconBook2 v-if="asset.type === 'surah'" :size="18" />
          <IconSparkles v-else :size="18" />
        </div>

        <div class="dm-item-info">
          <span class="dm-item-name">{{ asset.name }}</span>
          <span class="dm-item-type">{{ asset.type === 'surah' ? 'سورة' : 'أذكار' }}</span>
        </div>

        <button
          class="dm-item-action"
          :class="asset.status"
          @click="handleAssetAction(asset)"
          :disabled="asset.status === 'downloading' || (!online && asset.status === 'not-downloaded')"
        >
          <IconCheck v-if="asset.status === 'downloaded'" :size="16" />
          <IconLoader2 v-else-if="asset.status === 'downloading'" :size="16" class="spin" />
          <span v-else-if="asset.status === 'queued'" class="queued-dot"></span>
          <IconDownload v-else :size="16" />
        </button>
      </div>
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
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 16px;
  overflow: hidden;
  contain: layout style;
}

/* Header */
.dm-header {
  background: linear-gradient(135deg, var(--bs-primary) 0%, color-mix(in srgb, var(--bs-primary) 80%, #000) 100%);
  color: white;
  padding: 1.5rem;
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
  gap: 0.75rem;
}

.dm-title-icon {
  width: 40px;
  height: 40px;
  opacity: 0.9;
}

.dm-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.dm-title p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

.dm-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dm-progress-ring {
  position: relative;
  width: 56px;
  height: 56px;
}

.dm-progress-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 3;
}

.ring-fill {
  fill: none;
  stroke: white;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dashoffset: 0;
  transition: stroke-dasharray 0.3s ease;
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
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
  opacity: 0.8;
}

/* Status Bar */
.dm-status-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.15);
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
  transition: background 0.15s, color 0.15s;
}

.dm-filter-btn:hover {
  background: var(--bs-tertiary-bg);
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
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.dm-action-btn:hover:not(:disabled) {
  background: var(--bs-tertiary-bg);
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

.dm-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.dm-item:last-child {
  border-bottom: none;
}

.dm-item.downloaded {
  background: color-mix(in srgb, var(--bs-success) 8%, transparent);
}

.dm-item.downloading {
  background: color-mix(in srgb, var(--bs-primary) 8%, transparent);
}

.dm-item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.dm-item-icon.surah {
  background: color-mix(in srgb, var(--bs-primary) 15%, transparent);
  color: var(--bs-primary);
}

.dm-item-icon.azkar {
  background: color-mix(in srgb, var(--bs-success) 15%, transparent);
  color: var(--bs-success);
}

.dm-item-info {
  flex: 1;
  min-width: 0;
}

.dm-item-name {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dm-item-type {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

.dm-item-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.dm-item-action.not-downloaded {
  background: var(--bs-tertiary-bg);
  color: var(--bs-primary);
}

.dm-item-action.not-downloaded:hover:not(:disabled) {
  background: var(--bs-primary);
  color: white;
}

.dm-item-action.downloaded {
  background: var(--bs-success);
  color: white;
}

.dm-item-action.downloaded:hover {
  background: var(--bs-danger);
}

.dm-item-action.downloading {
  background: var(--bs-primary);
  color: white;
}

.dm-item-action.queued {
  background: var(--bs-tertiary-bg);
  color: var(--bs-secondary-color);
}

.dm-item-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.queued-dot {
  width: 8px;
  height: 8px;
  background: var(--bs-secondary-color);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
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
