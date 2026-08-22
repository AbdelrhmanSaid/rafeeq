<script setup>
import { IconMoodEmpty } from '@tabler/icons-vue'

defineProps({
  message: { type: String, default: 'لا توجد نتائج مطابقة لعملية البحث' },
})
</script>

<template>
  <div class="py-10 text-center text-muted-foreground">
    <IconMoodEmpty class="mx-auto size-10" />
    <p class="mt-2">{{ message }}</p>
  </div>
</template>
