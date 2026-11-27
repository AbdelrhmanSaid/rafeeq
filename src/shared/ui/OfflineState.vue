<script setup>
import { IconWifiOff } from '@tabler/icons-vue'
import StatePanel from '@/shared/ui/StatePanel.vue'

defineProps({
  message: { type: String, default: 'تحقق من اتصالك بالإنترنت وحاول مجددًا.' },
  // Shows a "try again" button when given.
  retry: { type: Function, default: null },
})
</script>

<template>
  <StatePanel :icon="IconWifiOff" title="لا يوجد اتصال" :message="message">
    <button v-if="retry" type="button" class="btn btn-soft" @click="retry">إعادة المحاولة</button>
  </StatePanel>
</template>
