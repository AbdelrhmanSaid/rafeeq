<script setup>
import { Comment, Text, computed, inject, useSlots } from 'vue'
import { SETTINGS_PAGE_TITLE } from '../lib/sections'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  // The id of the switch in the actions slot; the header then becomes its label, so tapping the title toggles it.
  controlId: { type: String, default: null },
})

const slots = useSlots()

// On a screen with the same title (المظهر › المظهر) the row doesn't repeat it; its description still introduces it.
const pageTitle = inject(SETTINGS_PAGE_TITLE, null)
const shownTitle = computed(() => (props.title && props.title === pageTitle?.value ? '' : props.title))
const hasHeader = computed(() => !!(shownTitle.value || props.description || slots.actions))

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
  <section class="settings-section">
    <component
      :is="controlId ? 'label' : 'header'"
      v-if="hasHeader"
      :for="controlId || undefined"
      class="settings-section-header"
    >
      <div class="settings-section-heading">
        <h2 v-if="shownTitle" class="settings-section-title">{{ shownTitle }}</h2>
        <p v-if="description" class="settings-section-description" :class="{ 'is-intro': !shownTitle }">
          {{ description }}
        </p>
      </div>

      <div v-if="$slots.actions" class="settings-section-actions">
        <slot name="actions" />
      </div>
    </component>

    <div v-if="hasBody" class="settings-section-body" :class="{ 'has-header': hasHeader }">
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

.settings-section-description.is-intro {
  margin-top: 0;
}

.settings-section-actions {
  flex-shrink: 0;
}

.settings-section-body.has-header {
  margin-top: 0.875rem;
}
</style>
