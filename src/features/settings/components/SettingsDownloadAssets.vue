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

const filterButtonClass = (type) =>
  filterType.value === type
    ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary'
    : 'text-muted-foreground'

const filterCountClass = (type) => (filterType.value === type ? 'bg-primary-foreground/20' : 'bg-foreground/10')

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
  <!-- `contain` keeps the long asset list from invalidating layout for the rest
       of the settings page while downloads tick along. -->
  <div class="overflow-hidden rounded-xl border bg-card text-card-foreground [contain:layout_style]">
    <!-- Header -->
    <div class="border-b px-6 py-5">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <IconCloudDownload :size="20" />
          </span>
          <div>
            <h3 class="text-base font-semibold">التنزيلات</h3>
            <p class="mt-0.5 text-sm text-muted-foreground">للاستخدام بدون إنترنت</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex flex-col text-start">
            <span class="text-xl font-bold"
              >{{ toArabicNumerals(downloadedCount) }}/{{ toArabicNumerals(totalAssets) }}</span
            >
            <span class="text-xs text-muted-foreground">ملف محمّل</span>
          </div>
          <CircleProgress class="hidden md:block" :percentage="progressPercentage" />
        </div>
      </div>

      <!-- Status Bar -->
      <div
        v-if="isDownloading || isPaused || !online"
        class="mt-4 flex min-w-0 items-center gap-2 overflow-hidden rounded-md bg-primary/10 px-3 py-2 text-sm"
      >
        <template v-if="!online">
          <IconWifiOff :size="16" />
          <span class="min-w-0 truncate">لا يوجد اتصال بالإنترنت</span>
        </template>
        <template v-else-if="isDownloading && currentItem">
          <IconLoader2 :size="16" class="animate-spin" />
          <span class="min-w-0 truncate">جاري تحميل: {{ currentItem.name }}</span>
          <span class="min-w-0 truncate ms-auto opacity-70">{{ toArabicNumerals(pendingCount) }} متبقي</span>
        </template>
        <template v-else-if="isPaused">
          <IconPlayerPause :size="16" />
          <span class="min-w-0 truncate">التحميل متوقف مؤقتاً</span>
        </template>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3">
      <div class="flex gap-1">
        <Button variant="ghost" size="sm" :class="filterButtonClass('all')" @click="filterType = 'all'">
          الكل
          <span class="rounded-full px-1.5 py-0.5 text-xs" :class="filterCountClass('all')">
            {{ toArabicNumerals(totalAssets) }}
          </span>
        </Button>
        <Button variant="ghost" size="sm" :class="filterButtonClass('surah')" @click="filterType = 'surah'">
          <IconBook2 :size="14" />
          السور
          <span class="rounded-full px-1.5 py-0.5 text-xs" :class="filterCountClass('surah')">
            {{ toArabicNumerals(surahCount) }}
          </span>
        </Button>
        <Button variant="ghost" size="sm" :class="filterButtonClass('azkar')" @click="filterType = 'azkar'">
          <IconSparkles :size="14" />
          الأذكار
          <span class="rounded-full px-1.5 py-0.5 text-xs" :class="filterCountClass('azkar')">
            {{ toArabicNumerals(azkarCount) }}
          </span>
        </Button>
      </div>

      <div class="flex gap-2">
        <Button
          v-if="isDownloading || isPaused"
          variant="outline"
          size="icon-sm"
          :aria-label="isPaused ? 'استئناف' : 'إيقاف مؤقت'"
          @click="isPaused ? resumeDownloads() : pauseDownloads()"
        >
          <component :is="isPaused ? IconPlayerPlay : IconPlayerPause" :size="16" />
        </Button>

        <Button v-if="pendingCount > 0" variant="outline" size="icon-sm" title="إلغاء" @click="cancelAllDownloads">
          <IconX :size="16" />
        </Button>

        <Button
          variant="outline"
          size="icon-sm"
          class="hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
          :disabled="isDownloading || downloadedCount === 0"
          title="حذف الكل"
          @click="handleRemoveAll"
        >
          <IconTrash :size="16" />
        </Button>

        <Button size="sm" :disabled="isDownloading || !online || isCompleted" @click="queueAllAssets">
          <IconDownload :size="16" />
          <span>تحميل الكل</span>
        </Button>
      </div>
    </div>

    <!-- List -->
    <div class="dm-list max-h-75 overflow-y-auto">
      <DownloadAssetItem
        v-for="asset in filteredAssets"
        :key="asset.id"
        :asset="asset"
        :online="online"
        @action="handleAssetAction"
      />
    </div>

    <!-- Completed Banner -->
    <div
      v-if="isCompleted"
      class="flex items-center justify-center gap-2 bg-success p-3 text-sm font-medium text-success-foreground"
    >
      <IconCheck :size="20" />
      <span>تم تحميل جميع الملفات بنجاح!</span>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar pseudo-elements have no utility equivalent; the colors still come
   from the design tokens so runtime theming keeps working. */
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
