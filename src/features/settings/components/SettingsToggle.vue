<script setup>
import { useId } from 'vue'
import SettingsSection from './SettingsSection.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  label: { type: String, required: true },
})

const enabled = defineModel({ type: Boolean, required: true })
const inputId = useId()
</script>

<template>
  <SettingsSection :title="title" :description="description" :icon="icon" :control-id="inputId">
    <template #actions>
      <div class="form-check form-switch m-0">
        <input :id="inputId" v-model="enabled" class="form-check-input" type="checkbox" :aria-label="label" />
      </div>
    </template>
  </SettingsSection>
</template>
