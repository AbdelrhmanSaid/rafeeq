<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  size: {
    type: Number,
    default: 1,
  },
})
</script>

<template>
  <div>
    <p :class="`h${size}`">{{ title }}</p>
    <p class="lead" v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>
