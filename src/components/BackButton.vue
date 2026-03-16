<script setup>
import { IconArrowLeft } from '@tabler/icons-vue'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  label: {
    type: String,
    default: 'العودة',
  },
  buttonClass: {
    type: [String, Array, Object],
    default: 'btn-flat',
  },
  embedHidden: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <RouterLink :to="props.to" class="btn d-inline-flex align-items-center gap-2" :class="[props.buttonClass, { 'embed-hidden': embedHidden }]">
    <IconArrowLeft size="1.25rem" />
    <span>{{ props.label }}</span>
  </RouterLink>
</template>
