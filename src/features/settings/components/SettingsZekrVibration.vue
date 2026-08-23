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
      <Switch
        v-model="zekrVibrationEnabled"
        class="relative before:absolute before:-inset-3.5 before:content-['']"
        aria-label="تفعيل الاهتزاز عند الانتهاء"
      />
    </template>
    <div v-if="zekrVibrationEnabled">
      <div class="flex items-baseline justify-between gap-3">
        <span class="text-sm font-medium">قوة الاهتزاز</span>
        <span class="text-sm text-muted-foreground tabular-nums">{{ vibrationValueLabel }} مللي ثانية</span>
      </div>
      <Slider
        v-model="vibrationIntensity"
        class="mt-2 min-h-11 [&_[data-slot=slider-thumb]]:size-5"
        :min="20"
        :max="250"
        :step="10"
        aria-label="قوة الاهتزاز"
      />
      <div class="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>خفيف</span>
        <span>قوي</span>
      </div>
    </div>
  </SettingsSection>
</template>
