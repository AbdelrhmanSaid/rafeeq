<script setup>
import { storeToRefs } from 'pinia'
import { IconDeviceFloppy } from '@tabler/icons-vue'
import { useAppStore } from '@/app/stores/app'
import { Switch } from '@/shared/components/ui/switch'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { zekrSaveProgress } = storeToRefs(appStore)
</script>

<template>
  <SettingsSection
    title="حفظ التقدم"
    description="يحفظ تقدمك في كل قسم من الأذكار ويعيد ضبطه يومياً"
    :icon="IconDeviceFloppy"
  >
    <template #actions>
      <Switch
        v-model="zekrSaveProgress"
        class="relative before:absolute before:-inset-3 before:content-['']"
        aria-label="تفعيل حفظ تقدم الأذكار"
      />
    </template>
  </SettingsSection>
</template>
