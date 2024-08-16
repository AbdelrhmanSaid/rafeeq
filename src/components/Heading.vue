<script setup>
defineProps(['title', 'subtitle'])
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p class="lead" v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>
