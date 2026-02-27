<script setup>
import { toArabicNumerals } from '@/utilities/arabic'

defineProps({
  code: {
    type: Number,
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
        <h1 class="display-1">{{ toArabicNumerals(code) }}</h1>
        <p class="lead">{{ message }}</p>
      </div>
    </div>
  </div>
</template>
