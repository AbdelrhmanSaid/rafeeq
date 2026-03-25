<script setup>
import Logo from '@/components/Logo.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div
    class="hadith-export bg-white p-4 d-flex flex-column justify-content-between align-items-center text-center"
    data-bs-theme="light"
  >
    <div class="mb-3">
      <Logo />
    </div>

    <div class="flex-fill d-flex flex-column justify-content-center w-100">
      <p class="font-quran fs-4 lh-base text-dark mb-3">{{ text }}</p>
    </div>

    <div class="mt-auto pt-3">
      <span class="badge rounded-pill px-3 py-2 title-badge">{{ title }}</span>
    </div>
  </div>
</template>

<style scoped>
.hadith-export {
  min-height: 512px;
  max-width: 512px;
}

.title-badge {
  background: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
  border: 1px solid rgba(var(--bs-primary-rgb), 0.2);
}
</style>
