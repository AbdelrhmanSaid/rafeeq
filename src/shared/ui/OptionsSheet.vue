<script setup>
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import OptionsList from '@/shared/ui/OptionsList.vue'

// The choices of a select in a bottom sheet (a dialog on desktop). Choosing one closes it.
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, required: true },
  // [{ value, label, hint? }]
  options: { type: Array, required: true },
  searchable: { type: Boolean, default: null },
  searchPlaceholder: { type: String, default: undefined },
  emptyMessage: { type: String, default: undefined },
})

const model = defineModel({ type: [String, Number], default: '' })
const emit = defineEmits(['close'])
</script>

<template>
  <BottomSheet :show="show" :title="title" @close="emit('close')">
    <OptionsList
      v-model="model"
      :label="title"
      :options="options"
      :searchable="searchable"
      :search-placeholder="searchPlaceholder"
      :empty-message="emptyMessage"
      @choose="emit('close')"
    />
  </BottomSheet>
</template>
