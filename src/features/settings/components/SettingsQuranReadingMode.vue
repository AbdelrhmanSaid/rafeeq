<script setup>
import { useQuranStore } from '@/features/quran/store.js'
import { IconArrowsHorizontal, IconArrowsVertical, IconBook2 } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'

const quranStore = useQuranStore()

const modes = [
  { value: 'vertical', label: 'عمودي', icon: IconArrowsVertical },
  { value: 'horizontal', label: 'أفقي', icon: IconArrowsHorizontal },
]
</script>

<template>
  <SettingsSection
    title="طريقة القراءة"
    description="تصفح السورة بالتمرير العمودي أو صفحة بصفحة أفقياً"
    :icon="IconBook2"
  >
    <div class="btn-group-toggle">
      <button
        v-for="mode in modes"
        :key="mode.value"
        class="btn-toggle"
        :class="{ active: quranStore.readingMode === mode.value }"
        :aria-pressed="quranStore.readingMode === mode.value"
        @click="quranStore.readingMode = mode.value"
      >
        <component :is="mode.icon" :size="16" />
        <span>{{ mode.label }}</span>
      </button>
    </div>
  </SettingsSection>
</template>
