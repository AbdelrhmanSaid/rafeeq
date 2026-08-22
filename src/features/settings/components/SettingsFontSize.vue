<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/app/stores/theme'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { MIN_FONT_SCALE, MAX_FONT_SCALE, DEFAULT_FONT_SCALE, FONT_SCALE_STEP } from '@/shared/utils/css'
import { IconTextSize, IconRotate } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import { Slider } from '@/shared/components/ui/slider'
import SettingsSection from './SettingsSection.vue'

const theme = useThemeStore()
const { fontScale } = storeToRefs(theme)

const min = MIN_FONT_SCALE
const max = MAX_FONT_SCALE
const step = FONT_SCALE_STEP

const scaleLabel = computed(() => `${toArabicNumerals(fontScale.value)}٪`)
const isDefault = computed(() => fontScale.value === DEFAULT_FONT_SCALE)

// The slider works on an array of thumb values; the store keeps a single scale.
const sliderValue = computed(() => [fontScale.value])

function onSlide(value) {
  const [next] = value ?? []
  if (next != null) theme.setFontScale(next)
}

function decrease() {
  theme.setFontScale(fontScale.value - step)
}

function increase() {
  theme.setFontScale(fontScale.value + step)
}
</script>

<template>
  <SettingsSection title="حجم الخط" description="تحكم في حجم النصوص في جميع أنحاء التطبيق" :icon="IconTextSize">
    <template #actions>
      <Button v-if="!isDefault" type="button" variant="ghost" size="sm" @click="theme.resetFontScale()">
        <IconRotate />
        <span>إعادة تعيين</span>
      </Button>
    </template>

    <div class="rounded-md border p-4">
      <div class="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          :disabled="fontScale <= min"
          aria-label="تصغير الخط"
          @click="decrease"
        >
          <span class="text-sm leading-none">أ</span>
        </Button>

        <Slider
          :model-value="sliderValue"
          class="flex-1"
          :min="min"
          :max="max"
          :step="step"
          aria-label="حجم الخط"
          @update:model-value="onSlide"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          :disabled="fontScale >= max"
          aria-label="تكبير الخط"
          @click="increase"
        >
          <span class="text-xl leading-none">أ</span>
        </Button>
      </div>

      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs text-muted-foreground">صغير</span>
        <span class="text-xs font-medium">{{ scaleLabel }}</span>
        <span class="text-xs text-muted-foreground">كبير</span>
      </div>

      <p class="mt-4 border-t pt-3 text-center text-muted-foreground">إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا</p>
    </div>
  </SettingsSection>
</template>
