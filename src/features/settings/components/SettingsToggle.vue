<script setup>
import SettingsSection from './SettingsSection.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  label: { type: String, required: true },
})

const enabled = defineModel({ type: Boolean, required: true })
</script>

<template>
  <SettingsSection :title="title" :description="description" :icon="icon">
    <template #actions>
      <div class="form-check form-switch m-0">
        <input v-model="enabled" class="form-check-input" type="checkbox" :aria-label="label" />
      </div>
    </template>
  </SettingsSection>
</template>
