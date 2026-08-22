<script setup>
import { toArabicNumerals } from '@/shared/utils/arabic'

defineProps({
  code: {
    type: Number,
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  message: {
    type: String,
    default: 'حدث خطأ، برجاء المحاولة في وقت لاحق.',
  },
})
</script>

<template>
  <div class="container-page">
    <div class="mx-auto max-w-lg text-center">
      <component v-if="icon" :is="icon" class="mx-auto mb-3 size-12 text-muted-foreground" />
      <h1 v-if="code" class="font-display text-6xl leading-tight">{{ toArabicNumerals(code) }}</h1>
      <p class="text-xl font-light text-muted-foreground">{{ message }}</p>
    </div>
  </div>
</template>
