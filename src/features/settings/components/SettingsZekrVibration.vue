<script setup>
import { computed, useId } from 'vue'
import { storeToRefs } from 'pinia'
import { IconDeviceMobileVibration } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import { toArabicNumerals } from '@/shared/utils/arabic'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrVibrationEnabled, zekrVibrationIntensity } = storeToRefs(appStore)

const vibrationValueLabel = computed(() => toArabicNumerals(zekrVibrationIntensity.value))
const switchId = useId()
</script>

<template>
  <SettingsSection
    title="الاهتزاز عند الانتهاء"
    description="يعمل على الأجهزة والمتصفحات التي تدعم الاهتزاز"
    :icon="IconDeviceMobileVibration"
    :control-id="switchId"
  >
    <template #actions>
      <div class="form-check form-switch m-0">
        <input
          :id="switchId"
          v-model="zekrVibrationEnabled"
          class="form-check-input"
          type="checkbox"
          aria-label="الاهتزاز عند الانتهاء"
        />
      </div>
    </template>

    <div v-if="zekrVibrationEnabled" class="p-3 border rounded">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-2">
        <span>قوة الاهتزاز</span>
        <small class="text-muted">{{ vibrationValueLabel }} مللي ثانية</small>
      </div>

      <input
        v-model.number="zekrVibrationIntensity"
        class="form-range"
        type="range"
        min="20"
        max="250"
        step="10"
        aria-label="قوة الاهتزاز"
        :aria-valuetext="`${vibrationValueLabel} مللي ثانية`"
      />

      <div class="d-flex justify-content-between text-muted">
        <small>خفيف</small>
        <small>قوي</small>
      </div>
    </div>
  </SettingsSection>
</template>
