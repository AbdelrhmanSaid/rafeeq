<script setup>
import { storeToRefs } from 'pinia'
import { IconRefresh } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import SettingsToggle from './SettingsToggle.vue'

const appStore = useAppStore()
const { autoUpdateServiceWorker } = storeToRefs(appStore)
</script>

<template>
  <SettingsToggle
    v-model="autoUpdateServiceWorker"
    title="التحديث التلقائي"
    description="عند التعطيل سيتم عرض إشعار لتحديث التطبيق"
    :icon="IconRefresh"
    label="تفعيل التحديث التلقائي"
  />
</template>
