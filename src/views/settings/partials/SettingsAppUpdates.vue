<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { autoUpdateServiceWorker } = storeToRefs(appStore)
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h6 class="card-title mb-3">تحديثات التطبيق</h6>
      <p class="card-text text-muted mb-3">التحكم في طريقة تحديث نسخة التطبيق عند توفر إصدار جديد.</p>

      <div class="p-3 border rounded d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div>
          <div class="fw-medium">التحديث التلقائي</div>
          <small class="text-muted">مفعّل افتراضياً. عند التعطيل سيتم عرض إشعار لتحديث التطبيق يدوياً.</small>
        </div>
        <div class="form-check form-switch m-0">
          <input id="swAutoUpdate" v-model="autoUpdateServiceWorker" class="form-check-input" type="checkbox" />
        </div>
      </div>
    </div>
  </div>
</template>
