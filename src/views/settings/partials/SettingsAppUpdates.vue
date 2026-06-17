<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { IconRefresh } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { autoUpdateServiceWorker } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection
    title="التحديث التلقائي"
    description="مفعّل افتراضياً. عند التعطيل سيتم عرض إشعار لتحديث التطبيق يدوياً"
    :icon="IconRefresh"
  >
    <template #actions>
      <div class="form-check form-switch m-0">
        <input id="swAutoUpdate" v-model="autoUpdateServiceWorker" class="form-check-input" type="checkbox" />
      </div>
    </template>
  </SettingsSection>
</template>
