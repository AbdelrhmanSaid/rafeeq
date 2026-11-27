<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  // The title is a heading, so the state can be found by heading; 1 where it is the whole screen, like the 404.
  level: { type: Number, default: 2 },
})
</script>

<template>
  <!-- The one pattern behind every error, offline and empty state: a tinted icon tile, a title, a line, an action. -->
  <div class="state-panel">
    <span v-if="icon" class="icon-tile state-panel__icon"><component :is="icon" aria-hidden="true" /></span>
    <component :is="`h${level}`" class="state-panel__title">{{ title }}</component>
    <p v-if="message" class="state-panel__message">{{ message }}</p>
    <div v-if="$slots.default" class="state-panel__actions">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 20rem;
  margin-inline: auto;
  padding-block: 2rem;
  text-align: center;
}

.state-panel__icon {
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 1rem;
  border-radius: var(--bs-border-radius);
  color: var(--app-primary-ink);

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
}

[data-bs-theme='dark'] .state-panel__icon {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.state-panel__title {
  margin: 0;
  /* A heading for assistive tech, with the panel's own look rather than the page headings'. */
  font-family: inherit;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: inherit;
}

.state-panel__message {
  margin: 0.25rem 0 0;
  color: var(--bs-secondary-color);
  font-size: 0.9375rem;
  line-height: 1.7;
}

.state-panel__actions {
  margin-top: 1.25rem;
}
</style>
