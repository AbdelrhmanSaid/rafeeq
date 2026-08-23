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
      <!-- The switch itself is only 1.15rem tall, so a transparent pseudo-element
           grows its hit area to the 2.75rem the rest of the app uses. -->
      <Switch
        v-model="zekrVibrationEnabled"
        class="relative before:absolute before:-inset-3.5 before:content-['']"
        aria-label="تفعيل الاهتزاز عند الانتهاء"
      />
    </template>

    <!-- The strength picker only exists while the feature is on, so it lives
         below the rule instead of dimming out in place. -->
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
