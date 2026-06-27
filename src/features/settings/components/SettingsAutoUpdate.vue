<script setup>
import { storeToRefs } from 'pinia'
import { IconRefresh } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { autoUpdateServiceWorker } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection title="التحديث التلقائي" description="عند التعطيل سيتم عرض إشعار لتحديث التطبيق" :icon="IconRefresh">
    <template #actions>
      <div class="form-check form-switch m-0">
        <input
          v-model="autoUpdateServiceWorker"
          class="form-check-input"
          type="checkbox"
          aria-label="تفعيل التحديث التلقائي"
        />
      </div>
    </template>
  </SettingsSection>
</template>
