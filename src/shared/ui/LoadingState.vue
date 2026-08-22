<script setup>
import { IconLoader2 } from '@tabler/icons-vue'

defineProps({
  message: {
    type: String,
    default: 'جاري التحميل...',
  },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <div role="status">
      <IconLoader2 class="size-8 animate-spin text-muted-foreground" />
      <span class="sr-only">جاري التحميل...</span>
    </div>

    <p class="text-xl font-light text-muted-foreground">{{ message }}</p>
  </div>
</template>
