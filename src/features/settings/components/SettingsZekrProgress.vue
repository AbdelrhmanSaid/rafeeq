<script setup>
import { storeToRefs } from 'pinia'
import { IconDeviceFloppy } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrSaveProgress } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection
    title="حفظ التقدم"
    description="يحفظ تقدمك في كل قسم من الأذكار ويعيد ضبطه يومياً"
    :icon="IconDeviceFloppy"
  >
    <template #actions>
      <div class="form-check form-switch m-0">
        <input
          v-model="zekrSaveProgress"
          class="form-check-input"
          type="checkbox"
          aria-label="تفعيل حفظ تقدم الأذكار"
        />
      </div>
    </template>
  </SettingsSection>
</template>
