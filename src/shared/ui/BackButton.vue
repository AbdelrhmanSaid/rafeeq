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
  buttonClass: {
    type: [String, Array, Object],
    default: '',
  },
  embedHidden: {
    type: Boolean,
    default: true,
  },
})

const baseClass = 'h-11 gap-1.5 rounded-full has-[>svg]:px-5 active:scale-95'
</script>
<template>
  <Button
    :as="RouterLink"
    :to="to"
    variant="ghost"
    :class="cn(baseClass, buttonClass, { 'embed-hidden': embedHidden })"
  >
    <IconChevronRight class="size-4 shrink-0" />
    <span>{{ label }}</span>
  </Button>
</template>
