<script setup>
import { IconMoodEmpty } from '@tabler/icons-vue'

defineProps({
  message: { type: String, default: 'لا توجد نتائج مطابقة لعملية البحث' },
})
</script>

<template>
  <div class="py-5 text-center">
    <span class="icon-circle icon-circle--lg text-secondary mx-auto mb-3">
      <IconMoodEmpty />
    </span>
    <p class="mb-0 text-body-secondary">{{ message }}</p>
  </div>
</template>
