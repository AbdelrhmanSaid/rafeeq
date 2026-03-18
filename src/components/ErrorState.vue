<script setup>
import { toArabicNumerals } from '@/utilities/arabic'

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
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-6 text-center">
        <component v-if="icon" :is="icon" size="3rem" class="mb-3" />
        <h1 v-if="code" class="display-1">{{ toArabicNumerals(code) }}</h1>
        <p class="lead">{{ message }}</p>
      </div>
    </div>
  </div>
</template>
