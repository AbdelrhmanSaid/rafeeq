<script setup>
import { computed } from 'vue'
import { normalizeNumberInput, toInputDisplay } from '@/features/zakat/lib/numberInput'

const props = defineProps({
  label: { type: String, required: true },
  unit: { type: String, default: '' },
  integer: { type: Boolean, default: false },
})

// The model is a plain number string ("1234.5") for the calculations; the field shows it in Arabic-Indic digits.
const model = defineModel({ type: [String, Number], default: '' })
const display = computed(() => toInputDisplay(model.value))

// A text field, not type="number", which would silently drop digits typed on an Arabic keyboard.
function onInput(event) {
  const input = event.target
  const caret = input.selectionStart ?? input.value.length
  const { value, caret: nextCaret } = normalizeNumberInput(input.value, caret, { integer: props.integer })
  model.value = value

  const shown = toInputDisplay(value)
  if (input.value !== shown) {
    input.value = shown
    input.setSelectionRange(nextCaret, nextCaret)
  }
}
</script>

<template>
  <label class="list-group-item zakat-row">
    <span class="zakat-row__label">{{ label }}</span>
    <input
      :value="display"
      class="zakat-row__input"
      type="text"
      dir="ltr"
      :inputmode="integer ? 'numeric' : 'decimal'"
      autocomplete="off"
      placeholder="—"
      :style="{ '--chars': display.length }"
      @input="onInput"
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
  /* Grows with the amount so it isn't cut off after blur. The placeholder is "—": an Arabic zero looks like a dot. */
  flex-shrink: 0;
  width: clamp(min(6.5rem, 40%), calc((var(--chars, 0) + 1) * 1ch), 60%);
  min-width: 0;
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
