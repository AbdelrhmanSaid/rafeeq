<script setup>
defineProps({
  message: {
    type: String,
    default: 'جاري التحميل...',
  },
})
</script>

<template>
  <div class="d-flex flex-column align-items-center justify-content-center gap-4">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">جاري التحميل...</span>
    </div>

    <p class="lead">{{ message }}</p>
  </div>
</template>
