<script setup>
import { computed, ref } from 'vue'
import { IconSelector } from '@tabler/icons-vue'
import OptionsSheet from '@/shared/ui/OptionsSheet.vue'

const props = defineProps({
  label: { type: String, required: true },
  // [{ value, label, hint? }]
  options: { type: Array, required: true },
})

const model = defineModel({ type: [String, Number], default: '' })

const selected = computed(() => props.options.find((option) => String(option.value) === String(model.value)))
const open = ref(false)
</script>

<template>
  <!-- An iOS-style row: the label on one side, the current choice and a chevron on the other. A tap opens the
       choices in a sheet. -->
  <button type="button" class="select-row" aria-haspopup="dialog" @click="open = true">
    <span class="select-row__label">{{ label }}</span>
    <span class="select-row__value">{{ selected?.label }}</span>
    <IconSelector class="select-row__chevron" aria-hidden="true" />
  </button>

  <OptionsSheet v-model="model" :show="open" :title="label" :options="options" @close="open = false" />
</template>

<style lang="scss" scoped>
.select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 3rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:focus-visible {
    border-radius: var(--bs-border-radius);
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: 2px;
  }
}

/* The value keeps its full width up to 60% of the row, and the label wraps beside it, so a large text size doesn't
   squeeze a short value like "تلقائي" down to a couple of letters. Only a long value is cut short. */
.select-row__label {
  flex: 1 1 auto;
  min-width: 0;
}

.select-row__value {
  flex: 0 0 auto;
  max-width: 60%;
  overflow: hidden;
  color: var(--bs-secondary-color);
  text-align: end;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-row__chevron {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--bs-secondary-color);
}
</style>
