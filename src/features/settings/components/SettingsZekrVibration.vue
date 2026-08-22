<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { IconDeviceMobileVibration } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { Switch } from '@/shared/components/ui/switch'
import { Slider } from '@/shared/components/ui/slider'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrVibrationEnabled, zekrVibrationIntensity } = storeToRefs(appStore)

const vibrationValueLabel = computed(() => toArabicNumerals(zekrVibrationIntensity.value))

// <Slider> models its thumbs as an array; the stored setting is a single number
// in milliseconds, so wrap/unwrap it here instead of changing what is persisted.
const vibrationIntensity = computed({
  get: () => [zekrVibrationIntensity.value],
  set: (value) => {
    if (value?.length) zekrVibrationIntensity.value = value[0]
  },
})
</script>

<template>
  <SettingsSection
    title="الاهتزاز عند الانتهاء"
    description="يعمل على الأجهزة والمتصفحات التي تدعم الاهتزاز"
    :icon="IconDeviceMobileVibration"
  >
    <template #actions>
      <Switch v-model="zekrVibrationEnabled" aria-label="تفعيل الاهتزاز عند الانتهاء" />
    </template>

    <div v-if="zekrVibrationEnabled" class="rounded-lg border p-3">
      <div class="mb-2 flex items-center justify-between gap-3">
        <span>قوة الاهتزاز</span>
        <span class="text-sm text-muted-foreground">{{ vibrationValueLabel }} مللي ثانية</span>
      </div>

      <Slider v-model="vibrationIntensity" :min="20" :max="250" :step="10" aria-label="قوة الاهتزاز" />

      <div class="mt-2 flex justify-between text-sm text-muted-foreground">
        <span>خفيف</span>
        <span>قوي</span>
      </div>
    </div>
  </SettingsSection>
</template>
