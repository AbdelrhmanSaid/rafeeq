<script setup>
import { cn } from '@/shared/lib/utils'

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
})
</script>

<template>
  <p data-slot="card-description" :class="cn('text-muted-foreground text-sm', props.class)">
    <slot />
  </p>
</template>
