<script setup>
import { computed } from 'vue'
import { toArabicNumerals } from '@/shared/utils/arabic'

const props = defineProps({
  percentage: { type: Number, required: true },
  size: { type: Number, default: 56 },
})

// The `size` prop stays a plain number for callers, but the ring is drawn in
// `rem` so it grows with the user's font-scale setting.
const boxSize = computed(() => `${props.size / 16}rem`)
</script>

<template>
  <div class="relative shrink-0" :style="{ width: boxSize, height: boxSize }">
    <svg viewBox="0 0 36 36" class="size-full -rotate-90">
      <circle class="fill-none stroke-primary/15" stroke-width="3.5" cx="18" cy="18" r="15.9155" />
      <circle
        class="fill-none stroke-primary transition-[stroke-dasharray] duration-500 ease-out"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-dashoffset="0"
        cx="18"
        cy="18"
        r="15.9155"
        :stroke-dasharray="`${percentage} 100`"
      />
    </svg>
    <span class="absolute inset-0 grid place-items-center text-xs font-medium text-primary tabular-nums">
      {{ toArabicNumerals(percentage) }}%
    </span>
  </div>
</template>
