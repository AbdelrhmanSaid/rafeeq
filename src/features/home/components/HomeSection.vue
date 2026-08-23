<script setup>
import Heading from '@/shared/ui/Heading.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="home-section">
    <Heading :size="2" class="home-section__heading" :title="title" :subtitle="subtitle" />
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.home-section + .home-section {
  margin-top: 3rem;
}

.home-section__heading {
  margin-bottom: 1.15rem;

  :deep(h2) {
    margin-bottom: 0.3rem;
    font-size: 1.35rem;
    font-weight: 600;
  }

  :deep(.lead) {
    margin-bottom: 0;
    font-size: 0.95rem;
    font-weight: 400;
    color: var(--bs-secondary-color);
  }
}
</style>
