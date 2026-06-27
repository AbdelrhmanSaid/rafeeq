<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { IconDeviceMobileVibration } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import { toArabicNumerals } from '@/shared/utils/arabic'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrVibrationEnabled, zekrVibrationIntensity } = storeToRefs(appStore)

const vibrationValueLabel = computed(() => toArabicNumerals(zekrVibrationIntensity.value))
</script>

<template>
  <SettingsSection
    title="الاهتزاز عند الانتهاء"
    description="يعمل على الأجهزة والمتصفحات التي تدعم الاهتزاز"
    :icon="IconDeviceMobileVibration"
  >
    <template #actions>
      <div class="form-check form-switch m-0">
        <input v-model="zekrVibrationEnabled" class="form-check-input" type="checkbox" />
      </div>
    </template>

    <div v-if="zekrVibrationEnabled" class="p-3 border rounded">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-2">
        <span>قوة الاهتزاز</span>
        <small class="text-muted">{{ vibrationValueLabel }} مللي ثانية</small>
      </div>

      <input v-model.number="zekrVibrationIntensity" class="form-range" type="range" min="20" max="250" step="10" />

      <div class="d-flex justify-content-between text-muted">
        <small>خفيف</small>
        <small>قوي</small>
      </div>
    </div>
  </SettingsSection>
</template>
