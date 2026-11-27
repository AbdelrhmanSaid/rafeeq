<script setup>
import { Comment, Text, computed, useSlots } from 'vue'

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  // The id of the switch in the actions slot; the header then becomes its label, so tapping the title toggles it.
  controlId: { type: String, default: null },
})

const slots = useSlots()

const hasBody = computed(() => {
  const nodes = slots.default?.() ?? []
  return nodes.some((node) => {
    if (node.type === Comment) return false
    if (node.type === Text) return String(node.children).trim() !== ''
    return true
  })
})
</script>

<template>
  <!-- One row in a settings group: the title and a muted description, the control at the end, any body below. -->
  <section class="settings-section">
    <component
      :is="controlId ? 'label' : 'header'"
      v-if="title || $slots.actions"
      :for="controlId || undefined"
      class="settings-section-header"
    >
      <div class="settings-section-heading">
        <h2 class="settings-section-title">{{ title }}</h2>
        <p v-if="description" class="settings-section-description">{{ description }}</p>
      </div>

      <div v-if="$slots.actions" class="settings-section-actions">
        <slot name="actions" />
      </div>
    </component>

    <div v-if="hasBody" class="settings-section-body" :class="{ 'has-header': title || $slots.actions }">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.settings-section {
  padding: 0.875rem 1rem;
}

.settings-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 2rem;
}

.settings-section-heading {
  min-width: 0;
}

.settings-section-title {
  margin: 0;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
}

.settings-section-description {
  margin: 0.125rem 0 0;
  color: var(--bs-secondary-color);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.settings-section-actions {
  flex-shrink: 0;
}

.settings-section-body.has-header {
  margin-top: 0.875rem;
}
</style>
