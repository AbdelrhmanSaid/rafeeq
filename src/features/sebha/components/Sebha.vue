<script setup>
import { computed, ref, useId } from 'vue'
import { useLocalStorage, useTimeoutFn } from '@vueuse/core'
import { IconRestore } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { BEADS, beadPositions, litBeads } from '@/features/sebha/lib/beads'

const count = useLocalStorage(STORAGE_KEYS.sebhaCount, 0)
if (!Number.isSafeInteger(count.value) || count.value < 0) count.value = 0
const countId = useId()

const digits = computed(() => String(count.value).length)

const BEAD_POSITIONS = beadPositions(120, 104)
const lit = computed(() => litBeads(count.value))

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
    <button type="button" class="sebha__tap" aria-label="تسبيحة" :aria-describedby="countId" @click="increment">
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
        <span class="sebha__count" :style="{ '--digits': digits }">{{ toArabicNumerals(count) }}</span>
      </span>
    </button>

    <span :id="countId" class="visually-hidden" role="status">{{ toArabicNumerals(count) }}</span>

    <button type="button" class="btn btn-flat sebha__reset" :disabled="count === 0" @click="reset">
      <IconRestore size="1.25rem" />
      <span>تصفير</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.sebha {
  --sebha-ring: min(18rem, 80vw, 100dvh - 9rem);

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
  width: var(--sebha-ring);
  height: auto;
}

@media (max-height: 30rem) {
  .sebha__tap {
    padding-block: 0.5rem;
  }
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

  &.is-current {
    fill: var(--app-primary-ink);
    stroke: var(--app-primary-ink);
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
  pointer-events: none;
}

/* Each digit is a little over half the font size wide; past four or so, the number shrinks to fit within the beads. */
.sebha__count {
  font-size: min(3.5rem, var(--sebha-ring) * 0.62 / (var(--digits, 1) * 0.6));
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
