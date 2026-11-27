<script setup>
import { computed } from 'vue'
import { IconSelector } from '@tabler/icons-vue'

const props = defineProps({
  label: { type: String, required: true },
  // [{ value, label }]
  options: { type: Array, required: true },
})

const model = defineModel({ type: [String, Number], default: '' })

const selected = computed(() => props.options.find((option) => String(option.value) === String(model.value)))

// A native select hands back strings; return the option's own value so numbers stay numbers.
function onChange(event) {
  const option = props.options.find((item) => String(item.value) === event.target.value)
  if (option) model.value = option.value
}
</script>

<template>
  <!-- An iOS-style row: the label on one side, the current choice and a chevron on the other.
       The native select covers the row invisibly, so a tap opens the phone's own picker. -->
  <label class="select-row">
    <span class="select-row__label">{{ label }}</span>
    <span class="select-row__value">{{ selected?.label }}</span>
    <IconSelector class="select-row__chevron" aria-hidden="true" />
    <select class="select-row__select" :value="String(model)" :aria-label="label" @change="onChange">
      <option v-for="option in options" :key="option.value" :value="String(option.value)">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style lang="scss" scoped>
.select-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3rem;
  cursor: pointer;
}

/* The select itself is invisible, so the row shows its keyboard focus. */
.select-row:has(.select-row__select:focus-visible) {
  border-radius: var(--bs-border-radius);
  outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
  outline-offset: 2px;
}

.select-row__label {
  flex-shrink: 0;
}

.select-row__value {
  flex: 1;
  min-width: 0;
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

.select-row__select {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
  /* 16px keeps iOS from zooming when the picker opens. */
  font-size: 16px;
}
</style>
