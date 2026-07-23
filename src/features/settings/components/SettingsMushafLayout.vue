<script setup>
import { IconBook2, IconBook, IconArrowAutofitDown } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'
import { useQuranStore } from '@/features/quran/store'

const store = useQuranStore()
</script>

<template>
  <SettingsSection title="عرض المصحف" description="اختر طريقة تصفح صفحات المصحف" :icon="IconBook2">
    <div class="btn-group-toggle">
      <button
        class="btn-toggle"
        :class="{ active: store.mushafLayout === 'flip' }"
        @click="store.mushafLayout = 'flip'"
      >
        <IconBook :size="16" />
        <span>تقليب الصفحات</span>
      </button>
      <button
        class="btn-toggle"
        :class="{ active: store.mushafLayout === 'scroll' }"
        @click="store.mushafLayout = 'scroll'"
      >
        <IconArrowAutofitDown :size="16" />
        <span>تمرير عمودي</span>
      </button>
    </div>
  </SettingsSection>
</template>
