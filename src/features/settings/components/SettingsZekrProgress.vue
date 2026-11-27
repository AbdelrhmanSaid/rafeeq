<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'
import SettingsToggle from './SettingsToggle.vue'

const appStore = useAppStore()
const { zekrSaveProgress } = storeToRefs(appStore)
</script>

<template>
  <SettingsToggle
    v-model="zekrSaveProgress"
    title="حفظ التقدم"
    description="يحفظ تقدمك في كل قسم من الأذكار ويعيد ضبطه يومياً"
    label="تفعيل حفظ تقدم الأذكار"
  />
</template>
