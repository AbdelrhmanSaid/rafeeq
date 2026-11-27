<script setup>
import { useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'
import { IconHeart, IconHeartFilled, IconLoader2, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-vue'
import { usePageHeader } from '@/layout/pageHeader'
import { stationTitle } from '@/features/radio/lib/stationLabel'
import { toArabicNumerals } from '@/shared/utils/arabic'

const props = defineProps({
  station: { type: Object, required: true },
  isPlaying: { type: Boolean, default: false },
  // Started but not heard yet (connecting, buffering or retrying); the button then cancels it.
  isConnecting: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  // Other stations to suggest under the player, each with its `slug`.
  similar: { type: Array, default: () => [] },
})

// `play-similar` fires with the tapped suggestion, which also opens that station's page.
defineEmits(['toggle', 'favorite', 'play-similar'])

// The station name is the page's large title: the app bar (or the desktop top nav) carries back and share.
usePageHeader({
  title: () => stationTitle(props.station),
  share: () => true,
  el: useTemplateRef('title'),
})

// Faint stars around the crescent, as [x, y, radius] in the scene's 360×240 box.
// They fade out towards the title side (see the `sky-stars-fade` mask), so the text sits on a clean sky.
const STARS = [
  [32, 138, 1.2],
  [104, 150, 1],
  [20, 70, 1],
  [44, 104, 1],
  [86, 124, 1.2],
  [60, 150, 1],
  [140, 30, 1.3],
  [176, 52, 1],
  [160, 96, 1.1],
  [128, 118, 1],
  [196, 20, 1],
  [214, 84, 1],
]

// Ctrl/Cmd/Shift-click or a middle click opens the station elsewhere; only a plain click plays it here.
const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0
</script>

<template>
  <div class="station">
    <!-- A night sky over a mosque skyline: crescent, stars, domes and minarets in silhouette.
         The scene fits whole and sits on the bottom edge (slicing it to fill a wide card cut off the crescent); the
         ground runs far past the viewBox on both sides, so the skyline still spans any width. -->
    <section class="sky">
      <svg class="sky__scene" viewBox="0 0 360 240" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <defs>
          <mask id="sky-crescent">
            <circle cx="104" cy="74" r="20" fill="#fff" />
            <circle cx="113" cy="67" r="17" fill="#000" />
          </mask>
          <linearGradient id="sky-stars-gradient" gradientUnits="userSpaceOnUse" x1="110" y1="0" x2="220" y2="0">
            <stop offset="0" stop-color="#fff" />
            <stop offset="1" stop-color="#000" />
          </linearGradient>
          <mask id="sky-stars-fade">
            <rect width="360" height="240" fill="url(#sky-stars-gradient)" />
          </mask>
        </defs>
        <rect x="74" y="44" width="60" height="60" class="sky__moon" mask="url(#sky-crescent)" />
        <g mask="url(#sky-stars-fade)">
          <circle v-for="([x, y, r], index) in STARS" :key="index" :cx="x" :cy="y" :r="r" class="sky__star" />
        </g>
        <path
          class="sky__skyline"
          d="M-2000 240V214H30V142L35 128L40 142V214H70Q70 180 95 172Q120 180 120 214H130V188Q130 140 180 128Q230 140 230 188V214H240Q240 180 265 172Q290 180 290 214H310V138L315 124L320 138V214H2360V240Z"
        />
        <rect x="179" y="112" width="2" height="16" class="sky__skyline" />
      </svg>

      <div class="sky__head">
        <div class="sky__text">
          <h1 ref="title" class="sky__title">{{ stationTitle(station) }}</h1>
          <p class="sky__meta">
            <span v-if="station.description">{{ station.description }}</span>
            <span class="sky__status" role="status">
              <span class="sky__dot" :class="{ 'is-live': isPlaying }"></span>
              {{ isPlaying ? 'بث مباشر' : isConnecting ? 'جاري الاتصال...' : 'جاهز للتشغيل' }}
            </span>
          </p>
        </div>

        <button
          class="sky__favorite embed-hidden"
          :class="{ 'is-favorite': isFavorite }"
          type="button"
          aria-label="المفضلة"
          :aria-pressed="isFavorite"
          @click="$emit('favorite')"
        >
          <IconHeartFilled v-if="isFavorite" />
          <IconHeart v-else />
        </button>
      </div>
    </section>

    <!-- Play rests on the skyline. -->
    <div class="station__controls">
      <button
        class="station__play"
        type="button"
        :aria-label="isPlaying || isConnecting ? `إيقاف ${stationTitle(station)}` : `تشغيل ${stationTitle(station)}`"
        @click="$emit('toggle')"
      >
        <IconLoader2 v-if="isConnecting" class="is-spinning" />
        <IconPlayerPause v-else-if="isPlaying" />
        <IconPlayerPlay v-else />
      </button>
    </div>

    <section v-if="similar.length" class="station__similar embed-hidden">
      <h2 class="list-title">إذاعات مشابهة</h2>
      <div class="list-group">
        <RouterLink
          v-for="(item, index) in similar"
          :key="item.slug"
          :to="{ name: 'radio-station', params: { slug: item.slug } }"
          class="list-group-item list-group-item-action d-flex align-items-center gap-3 station__row"
          @click="(event) => !isModifiedClick(event) && $emit('play-similar', item)"
        >
          <span class="list-index">{{ toArabicNumerals(index + 1) }}</span>
          <span class="station-name">
            <span class="fw-medium">{{ stationTitle(item) }}</span>
            <span v-if="item.description" class="station-name__detail">{{ item.description }}</span>
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.station {
  width: 100%;
}

/* The sky shares the prayer card's radius and brand colour, darkening towards the top like night. */
.sky {
  position: relative;
  overflow: hidden;
  height: 15rem;
  border-radius: var(--bs-border-radius-lg);
  box-shadow: var(--app-shadow-card);
  /* A soft light at the top, like the prayer card, over a sky that deepens towards the skyline. */
  background:
    radial-gradient(28rem 12rem at 50% 0, rgba(255, 255, 255, 0.16), transparent 70%),
    linear-gradient(180deg, color-mix(in srgb, var(--bs-primary) 70%, #000), var(--bs-primary));
  color: #fff;
}

.sky__scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Let the ground run past the viewBox; the rounded sky clips it. */
  overflow: visible;
}

.sky__moon {
  fill: color-mix(in srgb, #fff 90%, var(--bs-primary));
}

.sky__star {
  fill: color-mix(in srgb, #fff 70%, var(--bs-primary));
}

.sky__skyline {
  fill: color-mix(in srgb, var(--bs-primary) 35%, #000);
}

.sky__head {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 0;
}

.sky__text {
  min-width: 0;
  flex: 1;
}

.sky__favorite {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  /* Line the icon up with the title's corner while keeping a 44px target. */
  margin-top: -0.5rem;
  margin-inline-end: -0.625rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: #fff;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  &.is-favorite {
    color: #ff8a7d;
  }
}

.sky__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
}

.sky__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin: 0.25rem 0 0;
  color: color-mix(in srgb, #fff 80%, var(--bs-primary));
  font-size: 0.875rem;
}

.sky__status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.sky__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: color-mix(in srgb, #fff 55%, var(--bs-primary));

  &.is-live {
    background: #ff6b5b;
  }
}

.station__controls {
  position: relative;
  display: flex;
  justify-content: center;
  /* Pull the play button up so it rests on the skyline. */
  margin-top: -2.25rem;
}

.station__play {
  display: grid;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  padding: 0;
  border: 0.3rem solid var(--bs-body-bg);
  border-radius: 50%;
  background: var(--bs-primary);
  color: var(--app-on-primary);

  svg {
    width: 2rem;
    height: 2rem;
  }

  /* Darken instead of fading, so the sky behind the button never shows through. */
  &:active {
    background: color-mix(in srgb, var(--bs-primary) 85%, #000);
  }
}

.is-spinning {
  animation: station-spin 0.9s linear infinite;
}

@keyframes station-spin {
  to {
    transform: rotate(360deg);
  }
}

.station__similar {
  margin-top: 1.25rem;
}

.station__row {
  min-height: 3.5rem;
  /* List actions default to the muted text colour; the name stays full strength and only the detail is muted. */
  color: var(--bs-body-color);
}

/* Name, then the muted detail on the same line while it fits; at large text sizes the detail drops below and the
   name wraps instead of being cut to one word. */
.station-name {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 0.375em;
  min-width: 0;
  overflow-wrap: break-word;
}

.station-name__detail {
  color: var(--bs-secondary-color);
}
</style>
