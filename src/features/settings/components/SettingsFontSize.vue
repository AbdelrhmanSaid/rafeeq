<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/app/stores/theme'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { MIN_FONT_SCALE, MAX_FONT_SCALE, DEFAULT_FONT_SCALE, FONT_SCALE_STEP } from '@/shared/utils/css'
import { IconRotate } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'

const theme = useThemeStore()
const { fontScale } = storeToRefs(theme)

const min = MIN_FONT_SCALE
const max = MAX_FONT_SCALE
const step = FONT_SCALE_STEP

const scaleLabel = computed(() => `${toArabicNumerals(fontScale.value)}٪`)
const isDefault = computed(() => fontScale.value === DEFAULT_FONT_SCALE)

function decrease() {
  theme.setFontScale(fontScale.value - step)
}

function increase() {
  theme.setFontScale(fontScale.value + step)
}
</script>

<template>
  <SettingsSection title="حجم الخط" description="تحكم في حجم النصوص في جميع أنحاء التطبيق">
    <template #actions>
      <button
        v-if="!isDefault"
        type="button"
        class="btn btn-sm btn-flat d-inline-flex align-items-center justify-content-center gap-1 font-reset"
        aria-label="إعادة تعيين حجم الخط"
        @click="theme.resetFontScale()"
      >
        <IconRotate :size="15" />
        <span class="d-none d-md-inline">إعادة تعيين</span>
      </button>
    </template>

    <input
      v-model.number="fontScale"
      class="form-range d-block"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      aria-label="حجم الخط"
      :aria-valuetext="scaleLabel"
    />

    <div class="font-steps">
      <button type="button" class="font-step" :disabled="fontScale <= min" aria-label="تصغير الخط" @click="decrease">
        <span class="font-step-small">أ</span>
      </button>
      <span class="font-scale-value">{{ scaleLabel }}</span>
      <button type="button" class="font-step" :disabled="fontScale >= max" aria-label="تكبير الخط" @click="increase">
        <span class="font-step-large">أ</span>
      </button>
    </div>

    <p class="font-preview">إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا</p>
  </SettingsSection>
</template>

<style scoped>
.font-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.font-scale-value {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.font-step {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 50%;
  background: color-mix(in srgb, var(--bs-body-color) 6%, transparent);
  color: var(--bs-body-color);
  cursor: pointer;
  transition: background 0.15s;
}

.font-reset {
  min-width: 2.75rem;
  min-height: 2.75rem;
}

@media (hover: hover) and (pointer: fine) {
  .font-step:hover:not(:disabled) {
    background: color-mix(in srgb, var(--bs-body-color) 10%, transparent);
  }
}

.font-step:active:not(:disabled) {
  background: var(--app-surface-active);
}

.font-step:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.font-step-small {
  font-size: 0.85rem;
  line-height: 1;
}

.font-step-large {
  font-size: 1.35rem;
  line-height: 1;
}

.font-preview {
  margin: 0.75rem 0 0;
  color: var(--bs-secondary-color);
  text-align: center;
}
</style>
