<script setup>
import { computed, ref, watchEffect } from 'vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { getShortestRotation, getTapeTicks, normalizeAngle } from '@/features/qibla/lib/qibla'
import QiblaLocationNote from '@/features/qibla/components/QiblaLocationNote.vue'

const FACING_TOLERANCE = 2

const TAPE_WIDTH = 320
const CENTER = TAPE_WIDTH / 2
const HALF_RANGE = 50
const PX_PER_DEGREE = CENTER / HALF_RANGE

const CARDINALS = { 0: 'ش', 90: 'ق', 180: 'ج', 270: 'غ' }

const props = defineProps({
  qiblaDirection: { type: Number, required: true },
  distance: { type: Number, default: null },
  heading: { type: Number, default: 0 },
  live: { type: Boolean, default: false },
  trusted: { type: Boolean, default: true },
  accuracy: { type: Number, default: null },
  uncertainty: { type: Number, default: null },
  sunAzimuth: { type: Number, default: null },
  savedLocation: { type: Boolean, default: false },
  refreshingLocation: { type: Boolean, default: false },
})

defineEmits(['refresh-location'])

const centerDegree = computed(() => (props.live ? props.heading : props.qiblaDirection))
const ticks = computed(() => getTapeTicks(centerDegree.value, HALF_RANGE, 5))

const turn = computed(() => getShortestRotation(centerDegree.value, props.qiblaDirection))
const aligned = computed(() => props.live && Math.abs(turn.value) <= FACING_TOLERANCE)
const approximate = computed(() => props.uncertainty != null || (props.savedLocation && props.refreshingLocation))
const isFacing = computed(() => aligned.value && props.trusted && !approximate.value)

// Cleared only a couple of degrees past the edge, so a wobbling hand doesn't repeat the announcement.
const announcedFacing = ref(false)
watchEffect(() => {
  const off = Math.abs(turn.value)
  if (!props.live || !props.trusted || approximate.value) announcedFacing.value = false
  else if (off <= FACING_TOLERANCE) announcedFacing.value = true
  else if (off > FACING_TOLERANCE + 2) announcedFacing.value = false
})
const announcement = computed(() => (announcedFacing.value ? 'أنت تواجه القبلة' : ''))

// Past the tape's fade the Kaaba becomes an edge arrow, so the marker never sits over the wrong tick.
const EDGE_OFFSET = 32
const kaabaOutOfView = computed(() => Math.abs(turn.value) > EDGE_OFFSET)
const kaabaX = computed(() => CENTER + turn.value * PX_PER_DEGREE)
const arrowX = computed(() => CENTER + Math.sign(turn.value) * EDGE_OFFSET * PX_PER_DEGREE)

const sunTurn = computed(() =>
  props.live && props.sunAzimuth != null ? getShortestRotation(centerDegree.value, props.sunAzimuth) : null,
)
const sunInView = computed(() => sunTurn.value != null && Math.abs(sunTurn.value) <= HALF_RANGE - 5)
const sunX = computed(() => CENTER + sunTurn.value * PX_PER_DEGREE)
const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315]

// Rounded after wrapping, so 359.6° reads 0° rather than 360°.
const degrees = (value) => `${toArabicNumerals(Math.round(normalizeAngle(value)) % 360)}°`

const turnSide = computed(() => (turn.value > 0 ? 'يمينًا' : 'يسارًا'))
const turnAmount = computed(() => `${toArabicNumerals(Math.round(Math.abs(turn.value)))}°`)

const plusMinus = (value) => `±${toArabicNumerals(Math.max(1, Math.round(value)))}°`
const showsAccuracy = computed(() => props.live && props.accuracy != null && props.accuracy >= 0)
const showsSun = computed(() => props.live && props.sunAzimuth != null)
</script>

<template>
  <div class="qibla" :class="{ 'is-facing': isFacing }">
    <div class="qibla__reading">
      <bdi class="qibla__degrees" dir="ltr">{{ degrees(centerDegree) }}</bdi>
      <span class="qibla__caption">{{ live ? 'اتجاهك الآن' : 'اتجاه القبلة من الشمال' }}</span>
    </div>

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

      <g v-if="sunInView" class="qibla__sun" :transform="`translate(${sunX} 24)`">
        <circle r="4" />
        <line v-for="ray in SUN_RAYS" :key="ray" y1="-6.5" y2="-9" :transform="`rotate(${ray})`" />
      </g>

      <g v-if="!kaabaOutOfView" class="qibla__kaaba" :transform="`translate(${kaabaX} 24)`">
        <rect x="-10" y="-10" width="20" height="20" rx="2.5" class="qibla__kaaba-body" />
        <rect x="-10" y="-4" width="20" height="3.5" class="qibla__kaaba-band" />
      </g>
      <path
        v-else
        class="qibla__arrow"
        :transform="`translate(${arrowX} 24) scale(${turn > 0 ? 1 : -1} 1)`"
        d="M-4 -8 L4 0 L-4 8"
      />

      <line :x1="CENTER" :x2="CENTER" y1="8" y2="70" class="qibla__center" />
    </svg>

    <p class="qibla__hint">
      <template v-if="isFacing">أنت تواجه القبلة</template>
      <template v-else-if="aligned && savedLocation && refreshingLocation">اتجاه تقريبي، جاري تحديث موقعك…</template>
      <template v-else-if="aligned && uncertainty != null">
        اتجاه تقريبي <bdi dir="ltr">{{ plusMinus(uncertainty) }}</bdi>، موقعك غير دقيق
      </template>
      <template v-else-if="live">
        أدر هاتفك {{ turnSide }} <bdi dir="ltr">{{ turnAmount }}</bdi>
      </template>
      <template v-else>
        القبلة على <bdi dir="ltr">{{ degrees(qiblaDirection) }}</bdi>
      </template>
    </p>
    <span class="visually-hidden" role="status">{{ announcement }}</span>
    <p v-if="showsAccuracy || showsSun" class="qibla__note">
      <template v-if="showsAccuracy">
        دقة البوصلة <bdi dir="ltr">{{ plusMinus(accuracy) }}</bdi>
      </template>
      <template v-if="showsAccuracy && showsSun"> · </template>
      <template v-if="showsSun">
        الشمس على <bdi dir="ltr">{{ degrees(sunAzimuth) }}</bdi>
      </template>
    </p>
    <QiblaLocationNote
      :distance="distance"
      :saved-location="savedLocation"
      :refreshing-location="refreshingLocation"
      :imprecise-location="uncertainty != null"
      @refresh-location="$emit('refresh-location')"
    />
  </div>
</template>

<style lang="scss" scoped>
.qibla {
  --qibla-accent: var(--app-primary-ink);

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Deep gold on the light theme so the hint keeps 4.5:1 contrast. */
.qibla.is-facing {
  --qibla-accent: #7f6224;
}

[data-bs-theme='dark'] .qibla.is-facing {
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

.qibla__caption {
  margin: 0;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
}

.qibla__tape {
  width: min(20rem, 100%);
  height: auto;
  margin-top: 2rem;
  overflow: hidden;
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

.qibla__arrow {
  fill: none;
  stroke: var(--qibla-accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.qibla__sun {
  fill: #d9a521;
  stroke: #d9a521;
  stroke-width: 1.5;
  stroke-linecap: round;
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

.qibla__note {
  margin: 0;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
}

[data-bs-theme='dark'] .qibla:not(.is-facing) {
  --qibla-accent: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}
</style>
