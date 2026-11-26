<script setup>
import { IconAlertTriangle } from '@tabler/icons-vue'
import StatePanel from '@/shared/ui/StatePanel.vue'

defineProps({
  // Icons are functions, so the default must return one; Vue would otherwise call it as a factory.
  icon: { type: [Object, Function], default: () => IconAlertTriangle },
  title: { type: String, default: 'تعذّر التحميل' },
  message: { type: String, default: 'حدث خطأ غير متوقع، برجاء المحاولة مرة أخرى.' },
  // Shows a "try again" button when given.
  retry: { type: Function, default: null },
})
</script>

<template>
  <StatePanel :icon="icon" :title="title" :message="message">
    <button v-if="retry" type="button" class="btn btn-soft" @click="retry">إعادة المحاولة</button>
  </StatePanel>
</template>
