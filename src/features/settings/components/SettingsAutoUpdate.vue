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
      <!-- The switch itself is only 1.15rem tall, so a transparent pseudo-element
           grows its hit area to the 2.75rem the rest of the app uses. -->
      <Switch
        v-model="autoUpdateServiceWorker"
        class="relative before:absolute before:-inset-3.5 before:content-['']"
        aria-label="تفعيل التحديث التلقائي"
      />
    </template>
  </SettingsSection>
</template>
