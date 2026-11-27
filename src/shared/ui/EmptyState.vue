<script setup>
import { IconSearch } from '@tabler/icons-vue'
import StatePanel from '@/shared/ui/StatePanel.vue'

defineProps({
  title: { type: String, default: 'لا توجد نتائج' },
  message: { type: String, default: 'جرّب كلمة أخرى.' },
})
</script>

<template>
  <StatePanel :icon="IconSearch" :title="title" :message="message" />
</template>
