<script setup>
import { storeToRefs } from 'pinia'
import { IconArrowDownCircle } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import { Switch } from '@/shared/components/ui/switch'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrMoveNextOnComplete } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection
    title="الانتقال للذكر التالي"
    description="ينقلك تلقائياً إلى الذكر التالي عند إكمال العدد المطلوب"
    :icon="IconArrowDownCircle"
  >
    <template #actions>
      <Switch v-model="zekrMoveNextOnComplete" aria-label="تفعيل الانتقال التلقائي للذكر التالي" />
    </template>
  </SettingsSection>
</template>
