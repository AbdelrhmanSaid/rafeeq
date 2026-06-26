<script setup>
import { Comment, Text, computed, useSlots, inject } from 'vue'

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
})

const slots = useSlots()

// When rendered inside a "bare" context (e.g. a bottom sheet that supplies its
// own title/chrome) drop the card + header and render only the form body. Any
// SettingsSection-based card opts in automatically — no per-card changes.
const bare = inject('settings-bare', false)

// Whether the default slot renders anything meaningful (so we can drop the
// body wrapper entirely for header-only cards instead of leaving a gap).
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
  <div v-if="bare" class="settings-section-body">
    <slot />
  </div>

  <section v-else class="settings-section card h-100">
    <div class="card-body">
      <header v-if="title || $slots.actions" class="settings-section-header" :class="{ 'is-flush': !hasBody }">
        <div class="settings-section-heading">
          <span v-if="icon" class="settings-section-icon">
            <component :is="icon" :size="18" />
          </span>
          <div>
            <h6 class="settings-section-title">{{ title }}</h6>
            <p v-if="description" class="settings-section-description">{{ description }}</p>
          </div>
        </div>

        <div v-if="$slots.actions" class="settings-section-actions">
          <slot name="actions" />
        </div>
      </header>

      <div v-if="hasBody" class="settings-section-body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.settings-section-header.is-flush {
  margin-bottom: 0;
}

.settings-section-heading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.settings-section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: color-mix(in srgb, var(--bs-primary) 12%, transparent);
  color: var(--bs-primary);
}

.settings-section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.settings-section-description {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
}

.settings-section-actions {
  flex-shrink: 0;
}
</style>
