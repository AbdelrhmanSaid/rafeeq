<script setup>
import { storeToRefs } from 'pinia'
import { IconDeviceFloppy } from '@tabler/icons-vue'
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
    :icon="IconDeviceFloppy"
    label="تفعيل حفظ تقدم الأذكار"
  />
</template>
