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
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
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

const filterChipClass =
  'inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-95'

const filterButtonClass = (type) =>
  filterType.value === type
    ? 'bg-primary text-primary-foreground'
    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'

const filterCountClass = (type) =>
  cn(
    'rounded-full px-2 py-0.5 text-xs tabular-nums',
    filterType.value === type ? 'bg-primary-foreground/20' : 'bg-foreground/10',
  )

const bulkButtonClass =
  'size-11 shrink-0 rounded-full border-0 bg-muted shadow-none hover:bg-accent active:scale-95 dark:bg-muted dark:hover:bg-accent'

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
  <section class="divide-y overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm [contain:layout_style]">
    <div class="px-4 py-4">
      <div class="flex items-start gap-3">
        <span class="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
          <IconCloudDownload class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-sans text-base leading-snug font-medium">التنزيلات</h3>
          <p class="mt-0.5 text-sm leading-relaxed text-muted-foreground">للاستخدام بدون إنترنت</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="-me-2 size-11 shrink-0 rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground active:scale-95"
          :disabled="isDownloading || downloadedCount === 0"
          title="حذف الكل"
          aria-label="حذف الكل"
          @click="handleRemoveAll"
        >
          <IconTrash class="size-5" />
        </Button>
      </div>
      <div class="mt-4 flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
        <CircleProgress :percentage="progressPercentage" :size="44" />
        <div class="min-w-0">
          <div class="text-base font-medium tabular-nums">
            {{ toArabicNumerals(downloadedCount) }}/{{ toArabicNumerals(totalAssets) }}
          </div>
          <div class="text-sm text-muted-foreground">ملف محمّل</div>
        </div>
      </div>
      <!-- Status Bar -->
      <div
        v-if="isDownloading || isPaused || !online"
        class="mt-2 flex min-w-0 items-center gap-2 overflow-hidden rounded-2xl bg-primary/10 px-4 py-2.5 text-sm text-primary"
      >
        <template v-if="!online">
          <IconWifiOff class="size-4 shrink-0" />
          <span class="min-w-0 truncate">لا يوجد اتصال بالإنترنت</span>
        </template>
        <template v-else-if="isDownloading && currentItem">
          <IconLoader2 class="size-4 shrink-0 animate-spin" />
          <span class="min-w-0 truncate">جاري تحميل: {{ currentItem.name }}</span>
          <span class="ms-auto min-w-0 shrink-0 truncate opacity-70">{{ toArabicNumerals(pendingCount) }} متبقي</span>
        </template>
        <template v-else-if="isPaused">
          <IconPlayerPause class="size-4 shrink-0" />
          <span class="min-w-0 truncate">التحميل متوقف مؤقتاً</span>
        </template>
      </div>
    </div>
    <div
      class="flex gap-2 overflow-x-auto px-4 py-3 edge-fade-x no-scrollbar"
      style="--edge-fade-size: 1rem"
      role="group"
      aria-label="تصفية الملفات"
    >
      <button type="button" :class="cn(filterChipClass, filterButtonClass('all'))" @click="filterType = 'all'">
        <span>الكل</span>
        <span :class="filterCountClass('all')">{{ toArabicNumerals(totalAssets) }}</span>
      </button>
      <button type="button" :class="cn(filterChipClass, filterButtonClass('surah'))" @click="filterType = 'surah'">
        <IconBook2 class="size-4" />
        <span>السور</span>
        <span :class="filterCountClass('surah')">{{ toArabicNumerals(surahCount) }}</span>
      </button>
      <button type="button" :class="cn(filterChipClass, filterButtonClass('azkar'))" @click="filterType = 'azkar'">
        <IconSparkles class="size-4" />
        <span>الأذكار</span>
        <span :class="filterCountClass('azkar')">{{ toArabicNumerals(azkarCount) }}</span>
      </button>
    </div>
    <!-- List -->
    <div class="dm-list max-h-75 divide-y overflow-y-auto">
      <DownloadAssetItem
        v-for="asset in filteredAssets"
        :key="asset.id"
        :asset="asset"
        :online="online"
        @action="handleAssetAction"
      />
    </div>
    <div class="flex items-center gap-2 px-4 py-3">
      <Button
        v-if="isDownloading || isPaused"
        variant="outline"
        size="icon"
        :class="bulkButtonClass"
        :aria-label="isPaused ? 'استئناف' : 'إيقاف مؤقت'"
        @click="isPaused ? resumeDownloads() : pauseDownloads()"
      >
        <component :is="isPaused ? IconPlayerPlay : IconPlayerPause" class="size-5" />
      </Button>
      <Button
        v-if="pendingCount > 0"
        variant="outline"
        size="icon"
        :class="bulkButtonClass"
        title="إلغاء"
        aria-label="إلغاء"
        @click="cancelAllDownloads"
      >
        <IconX class="size-5" />
      </Button>
      <Button
        class="h-11 min-w-0 flex-1 rounded-full active:scale-95"
        :disabled="isDownloading || !online || isCompleted"
        @click="queueAllAssets"
      >
        <IconDownload class="size-4" />
        <span>تحميل الكل</span>
      </Button>
    </div>
    <!-- Completed Banner -->
    <div
      v-if="isCompleted"
      class="flex items-center justify-center gap-2 bg-success/12 p-3 text-sm font-medium text-success"
    >
      <IconCheck class="size-5" />
      <span>تم تحميل جميع الملفات بنجاح!</span>
    </div>
  </section>
</template>
<style scoped>
.dm-list::-webkit-scrollbar {
  width: 6px;
}

.dm-list::-webkit-scrollbar-track {
  background: transparent;
}

.dm-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.dm-list::-webkit-scrollbar-thumb:hover {
  background: var(--muted-foreground);
}
</style>
