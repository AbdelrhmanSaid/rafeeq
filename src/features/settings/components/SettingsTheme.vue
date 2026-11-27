<script setup>
import { useThemeStore } from '@/app/stores/theme'
import { THEMES } from '@/shared/constants/themes'
import SettingsSection from './SettingsSection.vue'
import SettingsSwatches from './SettingsSwatches.vue'

const theme = useThemeStore()

const colors = [
  { label: 'الافتراضي', value: '' },
  { label: 'أخضر', value: '#1B5E20' },
  { label: 'فيروزي', value: '#00897B' },
  { label: 'أزرق', value: '#1565C0' },
  { label: 'كحلي', value: '#0D47A1' },
  { label: 'رملي', value: '#C2A878' },
].map((color) => ({ ...color, swatch: color.value || '#795547' }))
</script>

<template>
  <SettingsSection title="المظهر" description="اختر وضع العرض واللون الأساسي للتطبيق">
    <div class="mb-3">
      <span class="d-block mb-2" aria-hidden="true">الوضع</span>
      <SettingsSwatches :model-value="theme.mode" label="الوضع" :options="THEMES" @update:model-value="theme.setMode" />
    </div>

    <div>
      <span class="d-block mb-2" aria-hidden="true">اللون الأساسي</span>
      <SettingsSwatches
        :model-value="theme.primaryColor"
        label="اللون الأساسي"
        :options="colors"
        @update:model-value="theme.setPrimaryColor"
      />
    </div>
  </SettingsSection>
</template>
