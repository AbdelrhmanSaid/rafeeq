<script setup>
import { computed } from 'vue'
import { useOnline } from '@vueuse/core'
import { IconDownload, IconCheck, IconLoader2, IconX, IconWifiOff } from '@tabler/icons-vue'
import { toast } from 'vue-sonner'
import { storeToRefs } from 'pinia'

import surahs from '@/exports/QuranSurahs.js'
import azkarCategories from '@/exports/AzkarCategories.js'
import { useDownloadsStore } from '@/stores/downloads'

const online = useOnline()

const downloadsStore = useDownloadsStore()
const {
  downloadedSurahs,
  downloadedAzkar,
  downloadState,
  totalAssets,
  alreadyDownloadedCount,
  progressPercentage,
  isCompleted,
  hasPartialDownloads,
} = storeToRefs(downloadsStore)

const confirmClearAllDownloads = () => {
  toast('هل أنت متأكد من حذف جميع التنزيلات؟', {
    id: 'confirm-clear-downloads',
    action: {
      label: 'تأكيد',
      onClick: () => downloadsStore.clearAllDownloads(),
    },
    cancel: {
      label: 'إلغاء',
    },
  })
}

const downloadButtonText = computed(() => {
  if (downloadState.value.isDownloading) return 'جاري التحميل...'
  if (isCompleted.value) return 'تم التحميل بالكامل'
  if (hasPartialDownloads.value) return 'استكمال التحميل'
  if (!online.value) return 'لا يوجد اتصال بالإنترنت'
  return 'بدء التحميل'
})

const downloadButtonIcon = computed(() => {
  if (downloadState.value.isDownloading) return IconLoader2
  if (isCompleted.value) return IconCheck
  if (!online.value) return IconWifiOff
  return IconDownload
})
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="card-title mb-0">تحميل جميع الملفات</h6>
      </div>

      <p class="card-text text-muted mb-3">تحميل جميع سور القرآن الكريم وملفات الأذكار للاستخدام دون اتصال بالإنترنت</p>

      <!-- Current Storage Status -->
      <div class="mb-3 p-3 border rounded">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-medium">حالة التخزين الحالية:</span>
          <span class="badge" :class="isCompleted ? 'bg-success' : hasPartialDownloads ? 'bg-warning' : 'bg-secondary'">
            {{ alreadyDownloadedCount }}/{{ totalAssets }}
          </span>
        </div>
        <div class="progress mb-2" style="height: 6px">
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
          <small class="text-muted">{{ downloadState.completed }}/{{ totalAssets }}</small>
        </div>
        <div class="progress" style="height: 8px">
          <div
            class="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            :style="{ width: progressPercentage + '%' }"
            :aria-valuenow="progressPercentage"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <div class="mt-1">
          <small class="text-muted">{{ progressPercentage }}%</small>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2 flex-wrap">
        <button
          type="button"
          class="btn btn-primary d-flex align-items-center gap-2"
          @click="downloadsStore.downloadAllAssets"
          :disabled="downloadState.isDownloading || !online || isCompleted"
        >
          <component :is="downloadButtonIcon" size="1.25rem" :class="{ spin: downloadState.isDownloading }" />
          <span>{{ downloadButtonText }}</span>
        </button>

        <button
          v-if="alreadyDownloadedCount > 0"
          type="button"
          class="btn btn-outline-danger d-flex align-items-center gap-2"
          @click="confirmClearAllDownloads"
          :disabled="downloadState.isDownloading"
        >
          <IconX size="1.25rem" />
          <span>مسح جميع التنزيلات</span>
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="isCompleted && !downloadState.isDownloading" class="alert alert-success mt-3 mb-0">
        <IconCheck size="1.25rem" class="me-2" />
        تم تحميل جميع الملفات بنجاح! يمكنك الآن استخدام التطبيق دون اتصال بالإنترنت.
      </div>
    </div>
  </div>
</template>
