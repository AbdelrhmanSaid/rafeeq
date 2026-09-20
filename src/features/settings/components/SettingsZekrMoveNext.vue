<script setup>
import { storeToRefs } from 'pinia'
import { IconArrowDownCircle } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import SettingsToggle from './SettingsToggle.vue'

const appStore = useAppStore()
const { zekrMoveNextOnComplete } = storeToRefs(appStore)
</script>

<template>
  <SettingsToggle
    v-model="zekrMoveNextOnComplete"
    title="الانتقال للذكر التالي"
    description="ينقلك تلقائياً إلى الذكر التالي عند إكمال العدد المطلوب"
    :icon="IconArrowDownCircle"
    label="تفعيل الانتقال التلقائي للذكر التالي"
  />
</template>
