<script setup>
import { IconWifiOff } from '@tabler/icons-vue'
import StatePanel from '@/shared/ui/StatePanel.vue'

defineProps({
  retry: { type: Function, default: null },
})
</script>

<template>
  <StatePanel :icon="IconWifiOff" title="لا يوجد اتصال" message="تحقق من اتصالك بالإنترنت وحاول مجددًا.">
    <button v-if="retry" type="button" class="btn btn-soft" @click="retry">إعادة المحاولة</button>
  </StatePanel>
</template>
