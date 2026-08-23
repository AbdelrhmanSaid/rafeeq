<script setup>
import { storeToRefs } from 'pinia'
import { IconDoorExit } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import { Switch } from '@/shared/components/ui/switch'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrConfirmOnLeave } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection title="تأكيد المغادرة" description="يطلب تأكيداً قبل مغادرة الذكر إذا لم يكتمل" :icon="IconDoorExit">
    <template #actions>
      <Switch
        v-model="zekrConfirmOnLeave"
        class="relative before:absolute before:-inset-3 before:content-['']"
        aria-label="تفعيل تأكيد المغادرة عند وجود أذكار غير مكتملة"
      />
    </template>
  </SettingsSection>
</template>
