<script setup>
import { storeToRefs } from 'pinia'
import { IconDoorExit } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrConfirmOnLeave } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection title="تأكيد المغادرة" description="يطلب تأكيداً قبل مغادرة الذكر إذا لم يكتمل" :icon="IconDoorExit">
    <template #actions>
      <div class="form-check form-switch m-0">
        <input
          v-model="zekrConfirmOnLeave"
          class="form-check-input"
          type="checkbox"
          aria-label="تفعيل تأكيد المغادرة عند وجود أذكار غير مكتملة"
        />
      </div>
    </template>
  </SettingsSection>
</template>
