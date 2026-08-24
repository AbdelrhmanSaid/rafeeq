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
import DownloadAssetItem from '@/features/downloads/components/DownloadAssetItem.vue'
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

const surahCount = computed(() => allAssets.value.filter((a) => a.type === 'surah').length)
const azkarCount = computed(() => allAssets.value.filter((a) => a.type === 'azkar').length)

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
  <div class="download-manager card">
    <!-- Header -->
    <div class="dm-header">
      <div class="dm-header-content">
        <div class="dm-title">
          <span class="icon-tile dm-title-icon">
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
      <div class="tab-pills dm-filters">
        <button class="tab-pill dm-filter-btn" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">
          <span>الكل</span>
          <span class="chip chip-muted dm-filter-count">{{ toArabicNumerals(totalAssets) }}</span>
        </button>
        <button
          class="tab-pill dm-filter-btn"
          :class="{ active: filterType === 'surah' }"
          @click="filterType = 'surah'"
        >
          <IconBook2 :size="16" />
          <span>السور</span>
          <span class="chip chip-muted dm-filter-count">{{ toArabicNumerals(surahCount) }}</span>
        </button>
        <button
          class="tab-pill dm-filter-btn"
          :class="{ active: filterType === 'azkar' }"
          @click="filterType = 'azkar'"
        >
          <IconSparkles :size="16" />
          <span>الأذكار</span>
          <span class="chip chip-muted dm-filter-count">{{ toArabicNumerals(azkarCount) }}</span>
        </button>
      </div>

      <div class="dm-actions">
        <button
          v-if="isDownloading || isPaused"
          class="btn btn-soft btn-icon dm-action-btn"
          @click="isPaused ? resumeDownloads() : pauseDownloads()"
          :title="isPaused ? 'استئناف' : 'إيقاف مؤقت'"
        >
          <component :is="isPaused ? IconPlayerPlay : IconPlayerPause" :size="16" />
        </button>

        <button
          v-if="pendingCount > 0"
          class="btn btn-soft btn-icon dm-action-btn"
          @click="cancelAllDownloads"
          title="إلغاء"
        >
          <IconX :size="16" />
        </button>

        <button
          class="btn btn-soft btn-icon dm-action-btn dm-action-btn--danger"
          @click="handleRemoveAll"
          :disabled="isDownloading || downloadedCount === 0"
          title="حذف الكل"
        >
          <IconTrash :size="16" />
        </button>

        <button
          class="btn btn-primary d-inline-flex align-items-center gap-2 dm-action-btn"
          @click="queueAllAssets"
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
  overflow: hidden;
  contain: layout style;
}

/* Header */
.dm-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--app-hairline);
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
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .dm-title-icon {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}

.dm-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.dm-title p {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
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
  font-variant-numeric: tabular-nums;
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
  padding: 0.55rem 0.85rem;
  background: var(--app-tint);
  color: var(--bs-body-color);
  border-radius: var(--bs-border-radius);
  font-size: 0.85rem;
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
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--app-hairline);
  flex-wrap: wrap;
}

.dm-filters {
  padding-bottom: 0;
  margin-inline: 0;
  padding-inline: 0;
}

.dm-filter-btn {
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.dm-filter-count {
  padding-block: 0.05rem;
  font-size: 0.72rem;
}

.dm-filter-btn.active .dm-filter-count {
  background: var(--app-tint-strong);
  color: inherit;
}

.dm-actions {
  display: flex;
  gap: 0.5rem;
}

.dm-action-btn {
  border-radius: 999px;
}

.dm-action-btn.btn-icon {
  width: 2.5rem;
  height: 2.5rem;
}

.dm-action-btn--danger:hover:not(:disabled) {
  --bs-btn-hover-bg: var(--bs-danger);
  --bs-btn-hover-color: #fff;
}

/* List */
.dm-list {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--app-hairline-strong) transparent;
}

/* Completed Banner */
.dm-completed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: color-mix(in srgb, var(--bs-success) 14%, transparent);
  color: var(--bs-success-text-emphasis);
  font-size: 0.85rem;
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
</style>
