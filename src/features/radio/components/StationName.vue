<script setup>
defineProps({
  name: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <span class="station-name">
    <span class="fw-medium">{{ name }}</span>
    <span v-if="description" class="station-name__detail">{{ description }}</span>
  </span>
</template>

<style scoped>
.station-name {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 0.375em;
  min-width: 0;
  overflow-wrap: break-word;
}

.station-name__detail {
  color: var(--bs-secondary-color);
}
</style>
