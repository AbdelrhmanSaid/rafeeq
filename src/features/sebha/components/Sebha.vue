<script setup>
import { computed, ref } from 'vue'
import { useLocalStorage, useTimeoutFn } from '@vueuse/core'
import { IconRestore } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { BEADS, beadPositions, litBeads } from '@/features/sebha/lib/beads'

// Open-ended counting with no target. The count is saved, so leaving the screen doesn't lose it.
const count = useLocalStorage(STORAGE_KEYS.sebhaCount, 0)

const BEAD_POSITIONS = beadPositions(120, 104)
const lit = computed(() => litBeads(count.value))

// When the ring starts over, the whole ring fades out together, slowly, while the first bead lights.
const wrapping = ref(false)
const { start: endWrapping } = useTimeoutFn(() => (wrapping.value = false), 600, { immediate: false })

function increment() {
  count.value += 1

  if (count.value > 1 && count.value % BEADS === 1) {
    wrapping.value = true
    endWrapping()
  }
}

function reset() {
  count.value = 0
}
</script>

<template>
  <div class="sebha">
    <!-- The whole area around the ring is the counter. -->
    <button type="button" class="sebha__tap" aria-label="تسبيحة" @click="increment">
      <svg class="sebha__ring" :class="{ 'is-wrapping': wrapping }" viewBox="0 0 240 240" aria-hidden="true">
        <circle cx="120" cy="120" r="104" class="sebha__string" />
        <circle
          v-for="(bead, index) in BEAD_POSITIONS"
          :key="index"
          :cx="bead.x"
          :cy="bead.y"
          r="8"
          class="sebha__bead"
          :class="{ 'is-lit': index < lit, 'is-current': index === lit - 1 }"
        />
      </svg>

      <span class="sebha__center">
        <span class="sebha__count">{{ toArabicNumerals(count) }}</span>
      </span>
    </button>

    <span class="visually-hidden" role="status">{{ toArabicNumerals(count) }}</span>

    <button type="button" class="btn btn-flat sebha__reset" :disabled="count === 0" @click="reset">
      <IconRestore size="1.25rem" />
      <span>تصفير</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.sebha {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

.sebha__tap {
  position: relative;
  display: grid;
  flex: 1;
  place-items: center;
  width: 100%;
  padding: 1rem 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.sebha__ring {
  grid-area: 1 / 1;
  width: min(18rem, 80vw);
  height: auto;
}

.sebha__string {
  fill: none;
  stroke: var(--app-hairline);
  stroke-width: 1.5;
}

.sebha__bead {
  fill: var(--app-surface);
  stroke: color-mix(in srgb, var(--bs-primary) 35%, var(--bs-body-bg));
  stroke-width: 1.5;
  /* Each bead fills in softly as it's reached, and the latest one swells a little, like a bead slipping under the thumb. */
  transform-box: fill-box;
  transform-origin: center;
  transition:
    fill 0.3s var(--app-ease-out),
    stroke 0.3s var(--app-ease-out),
    transform 0.3s var(--app-ease-out);

  &.is-lit {
    fill: color-mix(in srgb, var(--bs-primary) 70%, var(--bs-body-bg));
    stroke: color-mix(in srgb, var(--bs-primary) 70%, var(--bs-body-bg));
  }

  /* The latest bead is the full brand colour, so you can see where you are on the ring. */
  &.is-current {
    fill: var(--bs-primary);
    stroke: var(--bs-primary);
    transform: scale(1.2);
  }
}

.sebha__ring.is-wrapping .sebha__bead {
  transition-duration: 0.6s;
}

@media (prefers-reduced-motion: reduce) {
  .sebha__bead {
    transition: none;
  }
}

/* Dark mode lifts the lit beads towards white, like the app's other dark-mode accents. */
[data-bs-theme='dark'] .sebha__bead {
  &.is-lit {
    fill: color-mix(in srgb, var(--bs-primary) 70%, #fff);
    stroke: color-mix(in srgb, var(--bs-primary) 70%, #fff);
  }

  &.is-current {
    fill: color-mix(in srgb, var(--bs-primary) 35%, #fff);
    stroke: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}

.sebha__center {
  display: grid;
  grid-area: 1 / 1;
  justify-items: center;
  gap: 0.25rem;
  pointer-events: none;
}

.sebha__count {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.sebha__reset {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--bs-secondary-color);
}
</style>
