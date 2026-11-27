<script setup>
import { IconCheck } from '@tabler/icons-vue'

// Each option paints its dot with `swatch` and its check mark with `ink`.
defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
})

const model = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="swatch-grid" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="swatch-option"
      :class="{ active: model === option.value }"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      <span class="swatch-dot" :style="{ background: option.swatch, color: option.ink || '#fff' }">
        <IconCheck v-if="model === option.value" :size="14" aria-hidden="true" />
      </span>
      <span class="swatch-label">{{ option.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.swatch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
}

.swatch-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.25rem;
  border: 1px solid transparent;
  border-radius: var(--bs-border-radius-sm);
  background: none;
  cursor: pointer;
  transition: background 0.15s;
}

@media (hover: hover) and (pointer: fine) {
  .swatch-option:hover {
    background: rgba(var(--bs-secondary-rgb), 0.1);
  }
}

.swatch-option.active {
  background: rgba(var(--bs-secondary-rgb), 0.1);
  border-color: var(--app-hairline);
}

/* The inset ring keeps a white dot on a light page, or a black one on a dark page, from vanishing. */
.swatch-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(var(--bs-emphasis-color-rgb), 0.2);
}

/* Lifts the check off a two-tone dot, like the automatic theme's. */
.swatch-dot svg {
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.45));
}

.swatch-label {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}
</style>
