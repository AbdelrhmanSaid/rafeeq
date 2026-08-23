<script setup>
import { storeToRefs } from 'pinia'
import { IconRefresh } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import { Switch } from '@/shared/components/ui/switch'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { autoUpdateServiceWorker } = storeToRefs(appStore)
</script>
<template>
  <SettingsSection title="التحديث التلقائي" description="عند التعطيل سيتم عرض إشعار لتحديث التطبيق" :icon="IconRefresh">
    <template #actions>
      <Switch
        v-model="autoUpdateServiceWorker"
        class="relative before:absolute before:-inset-3.5 before:content-['']"
        aria-label="تفعيل التحديث التلقائي"
      />
    </template>
  </SettingsSection>
</template>
