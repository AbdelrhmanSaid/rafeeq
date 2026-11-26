<script setup>
defineProps({
  label: { type: String, required: true },
  unit: { type: String, default: '' },
  step: { type: [String, Number], default: 'any' },
})

const model = defineModel({ type: [String, Number], default: '' })
</script>

<template>
  <!-- A grouped row like Settings: the label on one side, the value and its unit on the other. -->
  <label class="list-group-item zakat-row">
    <span class="zakat-row__label">{{ label }}</span>
    <input
      v-model="model"
      class="zakat-row__input"
      type="number"
      inputmode="decimal"
      min="0"
      :step="step"
      placeholder="—"
    />
    <span v-if="unit" class="zakat-row__unit">{{ unit }}</span>
  </label>
</template>

<style lang="scss" scoped>
.zakat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3.25rem;
  cursor: text;
}

.zakat-row__label {
  flex: 1;
  min-width: 0;
}

.zakat-row__input {
  /* Narrow enough to leave the label room; an Arabic zero would look like a stray dot as placeholder, so "—" stands in. */
  width: 6.5rem;
  padding: 0.25rem 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--bs-body-color);
  /* 16px keeps iOS from zooming into the field. */
  font-size: max(1rem, 16px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  /*! rtl:ignore */
  text-align: left;

  &::placeholder {
    color: var(--bs-secondary-color);
    font-weight: 400;
  }
}

.zakat-row__unit {
  flex-shrink: 0;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
}
</style>
