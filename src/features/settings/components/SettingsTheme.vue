<script setup>
import { useThemeStore } from '@/app/stores/theme'
import { IconSunFilled, IconMoonStars, IconDeviceLaptop } from '@tabler/icons-vue'
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
    <div class="btn-group-toggle mb-3">
      <button
        class="btn-toggle"
        :class="{ active: theme.mode === 'light' }"
        :aria-pressed="theme.mode === 'light'"
        @click="theme.setMode('light')"
      >
        <IconSunFilled :size="16" />
        <span>فاتح</span>
      </button>
      <button
        class="btn-toggle"
        :class="{ active: theme.mode === 'dark' }"
        :aria-pressed="theme.mode === 'dark'"
        @click="theme.setMode('dark')"
      >
        <IconMoonStars :size="16" />
        <span>داكن</span>
      </button>
      <button
        class="btn-toggle"
        :class="{ active: theme.mode === 'system' }"
        :aria-pressed="theme.mode === 'system'"
        @click="theme.setMode('system')"
      >
        <IconDeviceLaptop :size="16" />
        <span>تلقائي</span>
      </button>
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
