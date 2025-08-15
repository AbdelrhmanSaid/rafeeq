<script setup>
import logo from '@/assets/images/logo.svg'

defineProps({
  text: {
    type: String,
    required: true,
  },
  repeat: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
  },
  benefit: {
    type: String,
  },
})
</script>

<template>
  <div class="zekr-export bg-white p-4 d-flex flex-column justify-content-between align-items-center text-center" data-bs-theme="light">
    <div class="mb-3">
      <img :src="logo" style="height: 48px; opacity: 0.8" />
    </div>

    <div class="flex-fill d-flex flex-column justify-content-center w-100">
      <p class="font-quran fs-4 lh-base text-dark mb-3">{{ text }}</p>

      <div class="mb-3" v-if="benefit || reference">
        <small class="text-muted">
          <span v-if="reference">{{ reference }}</span>
          <span v-if="benefit && reference"> - </span>
          <span v-if="benefit">{{ benefit }}</span>
        </small>
      </div>
    </div>

    <div class="mt-auto pt-3">
      <span class="badge rounded-pill px-3 py-2 repeat-badge"> التكرار: {{ repeat }} مرة </span>
    </div>
  </div>
</template>

<style scoped>
.zekr-export {
  min-height: 512px;
  max-width: 512px;
}

.zekr-export .text-muted {
  /* Ensure readability when global theme is dark but export background is light */
  color: #6c757d !important;
}

.repeat-badge {
  background: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
  border: 1px solid rgba(var(--bs-primary-rgb), 0.2);
}
</style>
