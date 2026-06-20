<script setup>
import { IconMoodEmpty } from '@tabler/icons-vue'

defineProps({
  message: { type: String, default: 'لا توجد نتائج مطابقة لعملية البحث' },
})
</script>

<template>
  <div class="py-5 text-center">
    <IconMoodEmpty size="2.5rem" />
    <p class="mt-2">{{ message }}</p>
  </div>
</template>
