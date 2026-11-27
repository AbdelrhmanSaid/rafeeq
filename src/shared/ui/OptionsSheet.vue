<script setup>
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import OptionsList from '@/shared/ui/OptionsList.vue'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, required: true },
  options: { type: Array, required: true },
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
      :search-placeholder="searchPlaceholder"
      :empty-message="emptyMessage"
      @choose="emit('close')"
    />
  </BottomSheet>
</template>
