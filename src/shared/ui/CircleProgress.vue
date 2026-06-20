<script setup>
import { toArabicNumerals } from '@/shared/utils/arabic'

defineProps({
  percentage: { type: Number, required: true },
  size: { type: Number, default: 56 },
})
</script>

<template>
  <div class="circle-progress" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 36 36">
      <circle class="ring-bg" cx="18" cy="18" r="15.9155" />
      <circle class="ring-fill" cx="18" cy="18" r="15.9155" :stroke-dasharray="`${percentage} 100`" />
    </svg>
    <span class="ring-text">{{ toArabicNumerals(percentage) }}%</span>
  </div>
</template>

<style scoped>
.circle-progress {
  position: relative;
}

.circle-progress svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-bg {
  fill: none;
  stroke: color-mix(in srgb, var(--bs-primary) 18%, transparent);
  stroke-width: 3;
}

.ring-fill {
  fill: none;
  stroke: var(--bs-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dashoffset: 0;
  transition: stroke-dasharray 0.3s ease;
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bs-primary);
}
</style>
