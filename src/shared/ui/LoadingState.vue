<script setup>
defineProps({
  message: {
    type: String,
    default: 'جاري التحميل...',
  },
})
</script>

<template>
  <div class="d-flex flex-column align-items-center justify-content-center gap-3">
    <div class="spinner-border loading-spinner" role="status">
      <span class="visually-hidden">جاري التحميل...</span>
    </div>

    <p class="mb-0 text-body-secondary">{{ message }}</p>
  </div>
</template>

<style scoped>
.loading-spinner {
  --bs-spinner-width: 2.25rem;
  --bs-spinner-height: 2.25rem;
  --bs-spinner-border-width: 0.2rem;
}
</style>
