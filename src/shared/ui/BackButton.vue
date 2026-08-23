<script setup>
import { RouterLink } from 'vue-router'
import { IconChevronRight } from '@tabler/icons-vue'
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
  <!-- The chevron points right: in an RTL document that is the "back" direction
       (nothing flips icons for us). -->
  <Button
    :as="RouterLink"
    :to="to"
    variant="ghost"
    :class="cn('h-11 gap-1.5 rounded-full px-5 active:scale-[0.98]', buttonClass, { 'embed-hidden': embedHidden })"
  >
    <IconChevronRight class="size-4 shrink-0" />
    <span>{{ label }}</span>
  </Button>
</template>
