<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { IconSelector } from '@tabler/icons-vue'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import OptionsSheet from '@/shared/ui/OptionsSheet.vue'
import OptionsMenu from '@/shared/ui/OptionsMenu.vue'

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
})

const model = defineModel({ type: [String, Number], default: '' })

const selected = computed(() => props.options.find((option) => String(option.value) === String(model.value)))
const open = ref(false)
const row = useTemplateRef('row')

const isPhone = useIsMobile()
</script>

<template>
  <div class="select-row">
    <button
      ref="row"
      type="button"
      class="select-row__button"
      :aria-haspopup="isPhone ? 'dialog' : 'true'"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="select-row__label">{{ label }}</span>
      <span class="select-row__value">{{ selected?.label }}</span>
      <IconSelector class="select-row__chevron" aria-hidden="true" />
    </button>

    <OptionsSheet v-if="isPhone" v-model="model" :show="open" :title="label" :options="options" @close="open = false" />
    <OptionsMenu
      v-else
      v-model="model"
      :show="open"
      :anchor="row"
      :title="label"
      :options="options"
      @close="open = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.select-row__button {
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

/* The value keeps its width up to 60% and the label wraps, so a large text size doesn't squeeze a short value. */
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
