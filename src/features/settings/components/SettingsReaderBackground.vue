<script setup>
import readerBackgrounds from '@/features/quran/data/readerBackgrounds.js'
import { useQuranStore } from '@/features/quran/store.js'
import SettingsSection from './SettingsSection.vue'
import SettingsSwatches from './SettingsSwatches.vue'

const quranStore = useQuranStore()

// The default follows the app's theme, so its dot is the app's own background.
const options = readerBackgrounds.map((background) => ({
  value: background.value,
  label: background.label,
  swatch: background.color ?? 'var(--bs-body-bg)',
  ink: background.mode === 'dark' ? '#fff' : background.mode === 'light' ? '#212529' : 'var(--bs-body-color)',
}))
</script>

<template>
  <SettingsSection title="خلفية المصحف" description="اختر لون صفحات المصحف أثناء القراءة">
    <SettingsSwatches v-model="quranStore.readerBackground" label="خلفية المصحف" :options="options" />
  </SettingsSection>
</template>
