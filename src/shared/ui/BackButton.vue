<script setup>
import { RouterLink } from 'vue-router'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
  label: {
    type: String,
    default: 'العودة',
  },
  // Extra utilities merged over the ghost button base. Later classes win
  // (`cn()` is tailwind-merge), so a caller can pass `bg-primary
  // text-primary-foreground` to get a solid button without fighting the base.
  buttonClass: {
    type: [String, Array, Object],
    default: '',
  },
  embedHidden: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <Button :as="RouterLink" :to="to" variant="ghost" :class="cn(buttonClass, { 'embed-hidden': embedHidden })">
    <span>{{ label }}</span>
  </Button>
</template>
