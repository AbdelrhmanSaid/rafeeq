<script setup>
import { DrawerRoot, useForwardPropsEmits } from 'reka-ui'

const props = defineProps({
  open: { type: Boolean, required: false },
  defaultOpen: { type: Boolean, required: false },
  modal: { type: [Boolean, String], required: false },
  swipeDirection: { type: String, required: false },
  snapPoints: { type: Array, required: false },
  snapPoint: { type: [Number, String, null], required: false },
  defaultSnapPoint: { type: [Number, String, null], required: false },
  snapToSequentialPoints: { type: Boolean, required: false },
})

const emits = defineEmits(['update:open', 'update:openComplete', 'update:snapPoint'])

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerRoot v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DrawerRoot>
</template>
