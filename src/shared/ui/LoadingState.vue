<script setup>
defineProps({
  // Read out to screen readers; the screen itself shows only the spinner.
  message: {
    type: String,
    default: 'جاري التحميل...',
  },
})
</script>

<template>
  <div class="loading-state" role="status">
    <span class="loading-state__spinner" aria-hidden="true"></span>
    <span class="visually-hidden">{{ message }}</span>
  </div>
</template>

<style scoped>
.loading-state {
  display: grid;
  place-items: center;
  padding-block: 2rem;
}

/* A small brand-coloured ring. */
.loading-state__spinner {
  width: 1.75rem;
  height: 1.75rem;
  border: 0.2rem solid color-mix(in srgb, var(--bs-primary) 20%, transparent);
  border-top-color: var(--bs-primary);
  border-radius: 50%;
  animation: loading-spin 0.8s linear infinite;
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-state__spinner {
    animation-duration: 2s;
  }
}
</style>
