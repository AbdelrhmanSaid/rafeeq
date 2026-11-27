<script setup>
import readerBackgrounds from '@/features/quran/data/readerBackgrounds.js'
import { useQuranStore } from '@/features/quran/store.js'
import { themeOf } from '@/shared/constants/themes'
import SettingsSection from './SettingsSection.vue'
import SettingsSwatches from './SettingsSwatches.vue'

const quranStore = useQuranStore()

// The default follows the app, so its dot is the app's own background.
const options = readerBackgrounds.map(({ value, label }) => ({
  value,
  label,
  swatch: themeOf(value)?.swatch ?? 'var(--bs-body-bg)',
  ink: themeOf(value)?.ink ?? 'var(--bs-body-color)',
}))
</script>

<template>
  <SettingsSection title="خلفية المصحف" description="اختر لون صفحات المصحف أثناء القراءة">
    <SettingsSwatches v-model="quranStore.readerBackground" label="خلفية المصحف" :options="options" />
  </SettingsSection>
</template>
