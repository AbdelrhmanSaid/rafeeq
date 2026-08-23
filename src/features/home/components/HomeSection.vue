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
    <div class="home-section__header">
      <Heading :size="2" class="home-section__heading" :title="title" :subtitle="subtitle" />
      <div v-if="$slots.actions" class="home-section__actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.home-section + .home-section {
  margin-top: 3.25rem;
}

.home-section__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.home-section__heading {
  position: relative;
  padding-inline-start: 0.9rem;

  /* Accent mark: a short primary bar that anchors every section title. */
  &::before {
    content: '';
    position: absolute;
    inset-inline-start: 0;
    top: 0.35rem;
    bottom: 0.35rem;
    width: 0.25rem;
    border-radius: 999px;
    background: linear-gradient(180deg, var(--bs-primary), color-mix(in srgb, var(--bs-primary) 45%, transparent));
  }

  :deep(h2) {
    margin-bottom: 0.25rem;
    font-size: 1.4rem;
    font-weight: 700;
  }

  :deep(.lead) {
    margin-bottom: 0;
    font-size: 0.95rem;
    font-weight: 400;
    color: var(--bs-secondary-color);
  }
}

.home-section__actions {
  flex-shrink: 0;
}
</style>
