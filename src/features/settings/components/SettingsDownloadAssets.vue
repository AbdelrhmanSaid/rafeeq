<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { IconDownload, IconPlayerPause, IconPlayerPlay, IconX, IconTrash, IconArrowBackUp } from '@tabler/icons-vue'
import { useDownloadStore } from '@/features/downloads/store.js'
import DownloadAssetItem from '@/features/downloads/components/DownloadAssetItem.vue'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
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

const TYPES = [
  { id: 'surah', label: 'السور' },
  { id: 'azkar', label: 'الأذكار' },
]
const activeType = ref('surah')

const assetsWithStatus = computed(() => {
  const queued = new Set(downloadQueue.value.map((item) => item.id))
  const current = currentItem.value?.id

  return allAssets.value.map((asset) => {
    let status = 'not-downloaded'
    if (isDownloaded(asset)) status = 'downloaded'
    else if (current === asset.id) status = 'downloading'
    else if (queued.has(asset.id)) status = 'queued'
    return { ...asset, status }
  })
})

const visibleAssets = computed(() => assetsWithStatus.value.filter((asset) => asset.type === activeType.value))

const countsByType = computed(() =>
  Object.fromEntries(
    TYPES.map(({ id }) => {
      const assets = assetsWithStatus.value.filter((asset) => asset.type === id)
      return [id, { total: assets.length, done: assets.filter((a) => a.status === 'downloaded').length }]
    }),
  ),
)

const remainingCount = computed(() => {
  const current = currentItem.value?.id
  return downloadQueue.value.filter((item) => item.id !== current).length
})

const status = computed(() => {
  if (isPaused.value) return `متوقف مؤقتاً · ${toArabicNumerals(pendingCount.value)} متبقٍ`
  if (!online.value && (isDownloading.value || pendingCount.value)) return 'لا يوجد اتصال، سيكمل التحميل عند عودته'
  if (isDownloading.value && currentItem.value) {
    const remaining = remainingCount.value ? ` · ${toArabicNumerals(remainingCount.value)} متبقٍ` : ''
    return `جاري تحميل ${currentItem.value.name}${remaining}`
  }
  if (isCompleted.value) return 'كل شيء محمّل ويعمل بدون إنترنت'
  if (!online.value) return 'لا يوجد اتصال بالإنترنت'
  return 'حمّل السور والأذكار لتعمل بدون إنترنت'
})

const isBusy = computed(() => isDownloading.value || isPaused.value)

const confirmingRemoveAll = ref(false)

const removeAll = async () => {
  confirmingRemoveAll.value = false
  await removeAllAssets()
}

const handleAssetAction = (asset) => {
  if (asset.status === 'downloaded') removeAsset(asset)
  else if (asset.status === 'queued') removeFromQueue(asset)
  else if (asset.status === 'not-downloaded') queueAsset(asset)
}
</script>

<template>
  <div class="downloads">
    <section class="downloads-group downloads-summary" aria-labelledby="downloads-count">
      <div class="downloads-summary__head">
        <h2 id="downloads-count" class="downloads-summary__count">
          {{ toArabicNumerals(downloadedCount) }}
          <span class="downloads-summary__total">من {{ toArabicNumerals(totalAssets) }} محمّل</span>
        </h2>
        <span class="downloads-summary__percent">{{ toArabicNumerals(progressPercentage) }}٪</span>
      </div>

      <div
        class="downloads-progress"
        role="progressbar"
        aria-labelledby="downloads-count"
        :aria-valuenow="progressPercentage"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="downloads-progress__fill" :style="{ transform: `scaleX(${progressPercentage / 100})` }"></span>
      </div>

      <p class="downloads-summary__status" aria-live="polite">{{ status }}</p>

      <div v-if="isBusy" class="downloads-summary__actions">
        <button type="button" class="btn btn-soft" @click="isPaused ? resumeDownloads() : pauseDownloads()">
          <component :is="isPaused ? IconPlayerPlay : IconPlayerPause" :size="16" aria-hidden="true" />
          <span>{{ isPaused ? 'استئناف' : 'إيقاف مؤقت' }}</span>
        </button>
        <button type="button" class="btn btn-soft" @click="cancelAllDownloads">
          <IconX :size="16" aria-hidden="true" />
          <span>إلغاء</span>
        </button>
      </div>

      <button
        v-else-if="!isCompleted"
        type="button"
        class="btn btn-primary downloads-summary__cta"
        :disabled="!online"
        @click="queueAllAssets"
      >
        <IconDownload :size="18" aria-hidden="true" />
        <span>تحميل الكل</span>
      </button>
    </section>

    <div class="btn-group-toggle downloads-tabs" role="group" aria-label="نوع التنزيلات">
      <button
        v-for="type in TYPES"
        :key="type.id"
        type="button"
        class="btn-toggle"
        :class="{ active: activeType === type.id }"
        :aria-pressed="activeType === type.id"
        @click="activeType = type.id"
      >
        <span>{{ type.label }}</span>
        <span class="downloads-tabs__count">
          {{ toArabicNumerals(countsByType[type.id].done) }}/{{ toArabicNumerals(countsByType[type.id].total) }}
        </span>
      </button>
    </div>

    <div class="downloads-group">
      <DownloadAssetItem
        v-for="asset in visibleAssets"
        :key="asset.id"
        :asset="asset"
        :online="online"
        @action="handleAssetAction"
      />
    </div>

    <div class="downloads-group">
      <button
        type="button"
        class="downloads-danger"
        :disabled="downloadedCount === 0"
        @click="confirmingRemoveAll = true"
      >
        <IconTrash :size="20" aria-hidden="true" />
        <span>حذف جميع التنزيلات</span>
      </button>
    </div>

    <BottomSheet :show="confirmingRemoveAll" title="حذف جميع التنزيلات" @close="confirmingRemoveAll = false">
      <p class="px-4 pt-1 mb-2 lh-lg text-secondary">
        ستُحذف السور والأذكار المحمّلة، ولن تعمل بدون إنترنت حتى تحمّلها من جديد.
      </p>
      <ul class="bottom-sheet-list">
        <li>
          <button type="button" class="bottom-sheet-item" @click="confirmingRemoveAll = false">
            <IconArrowBackUp size="20" />
            <span>الإبقاء عليها</span>
          </button>
        </li>
        <li>
          <button type="button" class="bottom-sheet-item text-danger" @click="removeAll">
            <IconTrash size="20" />
            <span>حذف الكل</span>
          </button>
        </li>
      </ul>
    </BottomSheet>
  </div>
</template>

<style lang="scss" scoped>
.downloads {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.downloads-group {
  overflow: hidden;
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-lg);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
}

.downloads-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.downloads-summary__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.downloads-summary__count {
  margin: 0;
  font-family: inherit;
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.downloads-summary__total,
.downloads-summary__percent {
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.downloads-progress {
  height: 0.375rem;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bs-body-color) 8%, transparent);
}

.downloads-progress__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--bs-primary);
  transform-origin: right;
  transition: transform 0.4s var(--app-ease-out);
}

[dir='ltr'] .downloads-progress__fill {
  transform-origin: left;
}

.downloads-summary__status {
  margin: 0;
  overflow: hidden;
  color: var(--bs-secondary-color);
  font-size: 0.8125rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.downloads-summary__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
}

.downloads-summary__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 2.75rem;
    /* px, so a large text size goes to the labels and both still fit a 320px phone. */
    padding-inline: 14px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
  }
}

.downloads-tabs__count {
  color: var(--bs-secondary-color);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.downloads-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 3rem;
  padding: 0.625rem 1rem;
  border: 0;
  background: none;
  color: var(--bs-danger);
  font-weight: 500;

  &:active:not(:disabled) {
    background: var(--app-surface-active);
  }

  &:disabled {
    color: var(--bs-secondary-color);
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .downloads-danger:hover:not(:disabled) {
    background: var(--app-surface-hover);
  }
}
</style>
