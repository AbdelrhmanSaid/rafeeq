<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'
import SettingsToggle from './SettingsToggle.vue'

const appStore = useAppStore()
const { zekrConfirmOnLeave } = storeToRefs(appStore)
</script>

<template>
  <SettingsToggle
    v-model="zekrConfirmOnLeave"
    title="تأكيد المغادرة"
    description="يطلب تأكيداً قبل مغادرة الذكر إذا لم يكتمل"
    label="تفعيل تأكيد المغادرة عند وجود أذكار غير مكتملة"
  />
</template>
