<script setup>
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
  <RouterLink
    :to="to"
    class="btn d-inline-flex align-items-center gap-2"
    :class="[buttonClass, { 'embed-hidden': embedHidden }]"
  >
    <span>{{ label }}</span>
  </RouterLink>
</template>
