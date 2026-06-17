<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { toArabicNumerals } from '@/utilities/arabic'

const appStore = useAppStore()
const { zekrVibrationEnabled, zekrVibrationIntensity } = storeToRefs(appStore)

const vibrationValueLabel = computed(() => toArabicNumerals(String(zekrVibrationIntensity.value)))
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h6 class="card-title mb-3">الأذكار</h6>
      <p class="card-text text-muted mb-3">التحكم في الاهتزاز عند الانتهاء من تكرار الذكر.</p>

      <div class="p-3 border rounded">
        <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
          <div>
            <div class="fw-medium">الاهتزاز عند الانتهاء</div>
            <small class="text-muted">يعمل على الأجهزة والمتصفحات التي تدعم الاهتزاز.</small>
          </div>
          <div class="form-check form-switch m-0">
            <input id="swZekrVibration" v-model="zekrVibrationEnabled" class="form-check-input" type="checkbox" />
          </div>
        </div>

        <div>
          <div class="d-flex justify-content-between align-items-center gap-3 mb-2">
            <span>قوة الاهتزاز</span>
            <small class="text-muted">{{ vibrationValueLabel }} مللي ثانية</small>
          </div>

          <input
            id="zekrVibrationIntensity"
            v-model.number="zekrVibrationIntensity"
            class="form-range"
            type="range"
            min="20"
            max="250"
            step="10"
            :disabled="!zekrVibrationEnabled"
          />

          <div class="d-flex justify-content-between text-muted">
            <small>خفيف</small>
            <small>قوي</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
