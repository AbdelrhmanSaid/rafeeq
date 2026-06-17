<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { toArabicNumerals } from '@/utilities/arabic'
import { MIN_FONT_SCALE, MAX_FONT_SCALE, DEFAULT_FONT_SCALE, FONT_SCALE_STEP } from '@/utilities/css'
import { IconTextSize, IconRotate } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'

const theme = useThemeStore()
const { fontScale } = storeToRefs(theme)

const min = MIN_FONT_SCALE
const max = MAX_FONT_SCALE
const step = FONT_SCALE_STEP

const scaleLabel = computed(() => `${toArabicNumerals(String(fontScale.value))}٪`)
const isDefault = computed(() => fontScale.value === DEFAULT_FONT_SCALE)

function decrease() {
  theme.setFontScale(fontScale.value - step)
}

function increase() {
  theme.setFontScale(fontScale.value + step)
}
</script>

<template>
  <SettingsSection title="حجم الخط" description="يتحكم في حجم النصوص في جميع أنحاء التطبيق" :icon="IconTextSize">
    <template #actions>
      <button
        v-if="!isDefault"
        type="button"
        class="btn btn-sm btn-flat d-inline-flex align-items-center gap-1"
        @click="theme.resetFontScale()"
      >
        <IconRotate :size="15" />
        <span>إعادة تعيين</span>
      </button>
    </template>

    <div class="p-3 border rounded">
      <div class="d-flex align-items-center gap-3">
        <button type="button" class="font-step" :disabled="fontScale <= min" aria-label="تصغير الخط" @click="decrease">
          <span class="font-step-small">أ</span>
        </button>

        <input
          v-model.number="fontScale"
          class="form-range flex-grow-1"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          aria-label="حجم الخط"
        />

        <button type="button" class="font-step" :disabled="fontScale >= max" aria-label="تكبير الخط" @click="increase">
          <span class="font-step-large">أ</span>
        </button>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-2">
        <small class="text-muted">صغير</small>
        <small class="fw-medium">{{ scaleLabel }}</small>
        <small class="text-muted">كبير</small>
      </div>

      <p class="font-preview mb-0 mt-3">إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا</p>
    </div>
  </SettingsSection>
</template>

<style scoped>
.font-step {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  background: none;
  color: var(--bs-body-color);
  cursor: pointer;
  transition: background 0.15s;
}

.font-step:hover:not(:disabled) {
  background: rgba(var(--bs-secondary-rgb), 0.1);
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
  text-align: center;
  color: var(--bs-secondary-color);
  border-top: 1px solid var(--bs-border-color);
  padding-top: 0.75rem;
}
</style>
