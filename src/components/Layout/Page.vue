<script setup>
defineProps({
  fluid: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <main class="page-container" :class="fluid ? 'container-fluid' : 'container'">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
.page-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>
