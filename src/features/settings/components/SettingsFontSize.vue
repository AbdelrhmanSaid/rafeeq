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

// Round, thumb-sized steppers flanking the track.
const stepperClass =
  'size-11 shrink-0 rounded-full border-0 bg-muted text-foreground shadow-none hover:bg-accent active:scale-95 dark:bg-muted dark:hover:bg-accent'
</script>

<template>
  <SettingsSection title="حجم الخط" description="تحكم في حجم النصوص في جميع أنحاء التطبيق" :icon="IconTextSize">
    <template #actions>
      <Button
        v-if="!isDefault"
        type="button"
        variant="ghost"
        class="h-11 rounded-full px-3 text-muted-foreground active:scale-[0.98]"
        @click="theme.resetFontScale()"
      >
        <IconRotate class="size-4" />
        <span>إعادة تعيين</span>
      </Button>
    </template>

    <div>
      <!-- The current scale leads: it is the value being changed, and it is
           rendered at the scale it sets. -->
      <div class="text-center">
        <span class="font-display text-3xl leading-none tabular-nums">{{ scaleLabel }}</span>
      </div>

      <div class="mt-5 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          :class="stepperClass"
          :disabled="fontScale <= min"
          aria-label="تصغير الخط"
          @click="decrease"
        >
          <span class="text-sm leading-none">أ</span>
        </Button>

        <Slider
          :model-value="sliderValue"
          class="min-h-11 flex-1 [&_[data-slot=slider-thumb]]:size-5"
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
          :class="stepperClass"
          :disabled="fontScale >= max"
          aria-label="تكبير الخط"
          @click="increase"
        >
          <span class="text-xl leading-none">أ</span>
        </Button>
      </div>

      <div class="mt-1 flex items-center justify-between px-14 text-xs text-muted-foreground">
        <span>صغير</span>
        <span>كبير</span>
      </div>

      <!-- A live sample of the chosen scale, in the interface font it applies to. -->
      <p class="mt-5 rounded-2xl bg-muted px-4 py-3 text-center leading-relaxed text-muted-foreground">
        إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
      </p>
    </div>
  </SettingsSection>
</template>
