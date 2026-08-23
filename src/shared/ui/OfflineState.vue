<script setup>
import { IconWifiOff } from '@tabler/icons-vue'

defineProps({
  message: { type: String, default: 'لا يوجد اتصال بالإنترنت' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 px-4 py-8 text-center">
    <span class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
      <IconWifiOff class="size-6" />
    </span>

    <p class="max-w-xs text-base leading-relaxed text-muted-foreground">{{ message }}</p>
  </div>
</template>
