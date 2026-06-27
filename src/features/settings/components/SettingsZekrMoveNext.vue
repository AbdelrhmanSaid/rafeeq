<script setup>
import { storeToRefs } from 'pinia'
import { IconArrowDownCircle } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrMoveNextOnComplete } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection
    title="الانتقال للذكر التالي"
    description="ينقلك تلقائياً إلى الذكر التالي عند إكمال العدد المطلوب"
    :icon="IconArrowDownCircle"
  >
    <template #actions>
      <div class="form-check form-switch m-0">
        <input
          v-model="zekrMoveNextOnComplete"
          class="form-check-input"
          type="checkbox"
          aria-label="تفعيل الانتقال التلقائي للذكر التالي"
        />
      </div>
    </template>
  </SettingsSection>
</template>
