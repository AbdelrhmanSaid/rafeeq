<script setup>
import { IconWifiOff } from '@tabler/icons-vue'

defineProps({
  message: { type: String, default: 'لا يوجد اتصال بالإنترنت' },
})
</script>

<template>
  <div class="d-flex flex-column align-items-center justify-content-center gap-3">
    <span class="icon-circle icon-circle--lg text-secondary">
      <IconWifiOff />
    </span>
    <p class="mb-0 text-body-secondary">{{ message }}</p>
  </div>
</template>
