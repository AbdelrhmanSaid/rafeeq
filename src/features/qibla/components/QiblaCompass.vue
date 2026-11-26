<script setup>
import { computed } from 'vue'
import { IconCompass } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { getShortestRotation, getTapeTicks, normalizeAngle } from '@/features/qibla/lib/qibla'

// Within this many degrees either side, you're facing the qibla.
const FACING_TOLERANCE = 5

// The tape spans ±HALF_RANGE degrees around the centre line, drawn PX_PER_DEGREE apart in a 320-wide box.
const TAPE_WIDTH = 320
const CENTER = TAPE_WIDTH / 2
const HALF_RANGE = 50
const PX_PER_DEGREE = CENTER / HALF_RANGE

const CARDINALS = { 0: 'ش', 90: 'ق', 180: 'ج', 270: 'غ' }

const props = defineProps({
  qiblaDirection: { type: Number, required: true },
  distance: { type: Number, default: null },
  heading: { type: Number, default: 0 },
  // A live compass: the tape follows the phone. Without one the tape rests on the qibla bearing.
  live: { type: Boolean, default: false },
  compassError: { type: String, default: null },
  canRequestPermission: { type: Boolean, default: false },
})

defineEmits(['request-permission'])

const centerDegree = computed(() => (props.live ? props.heading : props.qiblaDirection))
const ticks = computed(() => getTapeTicks(centerDegree.value, HALF_RANGE, 5))

// Positive: the qibla is to the right, so turn clockwise.
const turn = computed(() => getShortestRotation(centerDegree.value, props.qiblaDirection))
const isFacing = computed(() => props.live && Math.abs(turn.value) <= FACING_TOLERANCE)

// The Kaaba marker sits on the tape at the qibla bearing, or waits at the nearer edge when it's out of view.
const kaabaX = computed(() => {
  const offset = Math.max(-HALF_RANGE, Math.min(HALF_RANGE, turn.value))
  return CENTER + offset * PX_PER_DEGREE
})
const kaabaOutOfView = computed(() => Math.abs(turn.value) > HALF_RANGE)

const degrees = (value) => `${toArabicNumerals(Math.round(normalizeAngle(value)))}°`
const distanceLabel = computed(() =>
  props.distance == null ? '' : `${Math.round(props.distance).toLocaleString('ar-EG')} كم إلى مكة`,
)

// The instruction under the tape: which way to turn, and by how much.
const turnSide = computed(() => (turn.value > 0 ? 'يمينًا' : 'يسارًا'))
const turnAmount = computed(() => `${toArabicNumerals(Math.round(Math.abs(turn.value)))}°`)
</script>

<template>
  <div class="qibla" :class="{ 'is-facing': isFacing }">
    <div class="qibla__reading">
      <bdi class="qibla__degrees" dir="ltr">{{ degrees(centerDegree) }}</bdi>
      <span class="qibla__caption">{{ live ? 'اتجاهك الآن' : 'اتجاه القبلة من الشمال' }}</span>
    </div>

    <!-- The tape slides under a fixed centre line as the phone turns; ticks every 5°, labels every 10°. -->
    <svg class="qibla__tape" :viewBox="`0 0 ${TAPE_WIDTH} 96`" aria-hidden="true">
      <g v-for="tick in ticks" :key="tick.degree" :transform="`translate(${CENTER + tick.offset * PX_PER_DEGREE} 0)`">
        <line
          y1="48"
          :y2="tick.degree % 10 === 0 ? 64 : 58"
          class="qibla__tick"
          :class="{ 'is-major': tick.degree % 10 === 0 }"
        />
        <text v-if="tick.degree % 10 === 0" y="82" text-anchor="middle" class="qibla__label">
          {{ CARDINALS[tick.degree] ?? toArabicNumerals(tick.degree) }}
        </text>
      </g>

      <!-- The Kaaba: a dark cube with its gold band. -->
      <g class="qibla__kaaba" :class="{ 'is-away': kaabaOutOfView }" :transform="`translate(${kaabaX} 24)`">
        <rect x="-10" y="-10" width="20" height="20" rx="2.5" class="qibla__kaaba-body" />
        <rect x="-10" y="-4" width="20" height="3.5" class="qibla__kaaba-band" />
      </g>

      <line :x1="CENTER" :x2="CENTER" y1="8" y2="70" class="qibla__center" />
    </svg>

    <p class="qibla__hint">
      <template v-if="isFacing">أنت تواجه القبلة</template>
      <template v-else-if="live">
        أدر هاتفك {{ turnSide }} <bdi dir="ltr">{{ turnAmount }}</bdi>
      </template>
      <template v-else>
        القبلة على <bdi dir="ltr">{{ degrees(qiblaDirection) }}</bdi>
        <span v-if="compassError" class="d-block">{{ compassError }}</span>
      </template>
    </p>
    <p v-if="distanceLabel" class="qibla__distance">{{ distanceLabel }}</p>

    <button v-if="canRequestPermission" class="btn btn-primary mt-3" @click="$emit('request-permission')">
      <IconCompass class="me-2" size="1.25rem" />
      تفعيل البوصلة
    </button>
  </div>
</template>

<style lang="scss" scoped>
.qibla {
  --qibla-accent: var(--bs-primary);

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Facing the qibla: the centre line and the hint turn gold, the Kaaba's own colour. */
.qibla.is-facing {
  --qibla-accent: #b8913f;
}

.qibla__reading {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
}

.qibla__degrees {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.qibla__caption,
.qibla__distance {
  margin: 0;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
}

.qibla__tape {
  width: min(20rem, 100%);
  height: auto;
  margin-top: 2rem;
  overflow: hidden;
  /* Fade the tape out at both ends. */
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
}

.qibla__tick {
  stroke: var(--bs-secondary-color);
  stroke-width: 1;

  &.is-major {
    stroke: var(--bs-body-color);
    stroke-width: 1.5;
  }
}

.qibla__label {
  fill: var(--bs-secondary-color);
  font-size: 11px;
}

.qibla__center {
  stroke: var(--qibla-accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke 0.3s ease;
}

.qibla__kaaba.is-away {
  opacity: 0.5;
}

.qibla__kaaba-body {
  fill: #1f1b1a;
  stroke: #d9b26a;
  stroke-width: 1;
}

.qibla__kaaba-band {
  fill: #d9b26a;
}

.qibla__hint {
  margin: 1.5rem 0 0.25rem;
  font-weight: 600;
  color: var(--qibla-accent);
  transition: color 0.3s ease;
}

[data-bs-theme='dark'] .qibla:not(.is-facing) {
  --qibla-accent: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}
</style>
