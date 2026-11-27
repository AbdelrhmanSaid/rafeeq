<script setup>
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  linkLabel: {
    type: String,
    default: 'عرض الكل',
  },
})
</script>

<template>
  <section class="home-section">
    <div v-if="title" class="home-section__header">
      <h2 class="list-title home-section__title">{{ title }}</h2>
      <RouterLink v-if="to" :to="to" class="home-section__link">
        <span>{{ linkLabel }}</span>
        <IconChevronLeft size="1rem" aria-hidden="true" />
      </RouterLink>
    </div>
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.home-section + .home-section {
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .home-section + .home-section {
    margin-top: 2.75rem;
  }
}

.home-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0.125rem 0.75rem;
}

.home-section__title {
  margin: 0;
}

.home-section__link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.125rem;
  margin: -0.5rem -0.5rem -0.5rem 0;
  padding: 0.5rem;
  border-radius: var(--bs-border-radius);
  color: var(--app-primary-ink);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;

  &:active {
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
  }
}

[data-bs-theme='dark'] .home-section__link {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}
</style>
