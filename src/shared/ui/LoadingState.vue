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
  <div class="flex flex-col items-center justify-center gap-4 px-4 py-8 text-center">
    <div role="status" class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
      <IconLoader2 class="size-6 animate-spin" />
      <span class="sr-only">جاري التحميل...</span>
    </div>
    <p class="max-w-xs text-base leading-relaxed text-muted-foreground">{{ message }}</p>
  </div>
</template>
