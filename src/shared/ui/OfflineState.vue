<script setup>
import { IconWifiOff } from '@tabler/icons-vue'

defineProps({
  message: { type: String, default: 'لا يوجد اتصال بالإنترنت' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <IconWifiOff class="size-10 text-muted-foreground" />
    <p class="text-xl font-light text-muted-foreground">{{ message }}</p>
  </div>
</template>
