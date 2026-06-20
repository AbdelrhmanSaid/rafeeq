<script setup>
import { IconWifiOff } from '@tabler/icons-vue'

defineProps({
  message: { type: String, default: 'لا يوجد اتصال بالإنترنت' },
})
</script>

<template>
  <div class="d-flex flex-column align-items-center justify-content-center gap-4">
    <IconWifiOff size="2.5rem" class="text-muted" />
    <p class="lead">{{ message }}</p>
  </div>
</template>
