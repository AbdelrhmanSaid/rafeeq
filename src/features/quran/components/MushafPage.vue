<script setup>
import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { IconRefresh } from '@tabler/icons-vue'
import { loadPage } from '@/features/quran/lib/mushafStorage'
import {
  formatAyahCount,
  juzOfPage,
  parseVerseKey,
  plainSurahName,
  surahName,
  surahOfPage,
} from '@/features/quran/lib/mushaf'
import surahs from '@/features/quran/data/surahs.js'
import { toArabicNumerals } from '@/shared/utils/arabic'
import LoadingState from '@/shared/ui/LoadingState.vue'

const props = defineProps({
  page: { type: Number, required: true },
  selectedKey: { type: String, default: null },
  playingKey: { type: String, default: null },
  // Verse key → bookmark color id.
  bookmarks: { type: Map, default: () => new Map() },
})

const emit = defineEmits(['tap', 'select'])

const online = useOnline()
const data = shallowRef(null)
// A spinner only for a page that takes a moment (a first visit on a slow connection); a quick load shows nothing.
const slow = ref(false)
let slowTimer = 0
const fontFamily = ref('')
const failed = ref(false)

let loadId = 0
async function load() {
  const id = ++loadId
  failed.value = false
  clearTimeout(slowTimer)
  slowTimer = setTimeout(() => (slow.value = true), 250)
  try {
    const page = await loadPage(props.page)
    if (id !== loadId) return
    data.value = page.data
    fontFamily.value = page.fontFamily
  } catch {
    if (id === loadId) failed.value = true
  } finally {
    if (id === loadId) {
      clearTimeout(slowTimer)
      slow.value = false
    }
  }
}

watch(() => props.page, load, { immediate: true })
// A page that failed offline loads once the connection is back.
watch(online, (isOnline) => isOnline && failed.value && load())

// The header names the surah at the top of the page, as the printed Mushaf does, without vowel marks at its small size.
const headerSurah = computed(() => {
  const first = data.value && Object.keys(data.value.verses)[0]
  return first ? plainSurahName(parseVerseKey(first).surah) : ''
})

// The first piece of each ayah on the page is the one a keyboard or screen reader lands on.
const lines = computed(() => {
  if (!data.value) return []
  const seen = new Set()
  return data.value.lines.map((line) => {
    if (!line.segments) return line
    return {
      ...line,
      segments: line.segments.map(([key, glyphs]) => {
        const first = !seen.has(key)
        seen.add(key)
        return { key, glyphs, first }
      }),
    }
  })
})

// The glyphs mean nothing to a screen reader, so each ayah is read out from its text.
const ayahLabel = (key) => {
  const { surah, ayah } = parseVerseKey(key)
  return `${data.value.verses[key]} (${surahName(surah)}، الآية ${toArabicNumerals(ayah)})`
}

const markOf = (key) => {
  if (key === props.selectedKey) return 'is-selected'
  if (key === props.playingKey) return 'is-playing'
  const color = props.bookmarks.get(key)
  return color ? `is-bookmarked mark-${color}` : null
}

// The surah-names font draws "سورة" from the word "surah" and each name from its three-digit number. Those are
// left-to-right text, so the two words are laid out by the right-to-left row instead: "سورة" first, on the right.
const surahNumber = (surah) => String(surah).padStart(3, '0')

const surahInfo = (surah) => {
  const { isMeccan, numberOfAyahs } = surahs[surah - 1]
  return { place: isMeccan ? 'مكية' : 'مدنية', ayahs: numberOfAyahs }
}

// The name glyphs have uneven side bearings, so centring their boxes leaves the ink off-centre (by 4px on Al-Kahf).
// Each title is shifted by how far its ink sits from the middle, measured once per surah in em, and down to the
// cartouche's middle, which sits 0.079em (at the title's size) below the frame box's.
const titleOffsets = reactive(new Map())

async function centreTitles(surahIds) {
  const pending = surahIds.filter((id) => !titleOffsets.has(id))
  if (!pending.length || typeof document === 'undefined') return
  await document.fonts.load("100px 'Surah Names'")
  const context = document.createElement('canvas').getContext('2d')
  if (!context) return
  context.font = "100px 'Surah Names'"
  const gap = 30 // .surah-title's 0.3em gap, at 100px
  for (const id of pending) {
    // Left to right: the name, the gap, then "سورة".
    const name = context.measureText(surahNumber(id))
    const word = context.measureText('surah')
    const width = name.width + gap + word.width
    const inkLeft = -name.actualBoundingBoxLeft
    const inkRight = name.width + gap + word.actualBoundingBoxRight
    titleOffsets.set(id, Math.round((width / 2 - (inkLeft + inkRight) / 2) * 10) / 1000)
  }
}

watch(
  () => data.value?.lines.filter((line) => line?.surah).map((line) => line.surah),
  (ids) => ids?.length && centreTitles(ids),
  { immediate: true },
)

// A tap shows or hides the bars; holding an ayah selects it. Moving the finger (turning the page), lifting it, or a
// second finger cancels the hold. The pager takes the pointer once a drag starts, so the hold listens on the window.
const HOLD_MS = 450
let holdTimer = 0
let holdStart = null
// Touch selects by holding; the long-press menu a touch browser would open on its own is not a second way in.
let lastPointerType = 'mouse'

function cancelHold() {
  clearTimeout(holdTimer)
  holdTimer = 0
  holdStart = null
  window.removeEventListener('pointermove', onHoldMove)
  window.removeEventListener('pointerup', cancelHold)
  window.removeEventListener('pointercancel', cancelHold)
}

// The click that ends a hold isn't a tap. It may not even land on the page: the ayah's menu has opened under the
// finger, and its backdrop would take the click and close it.
function swallowNextClick() {
  const swallow = (event) => {
    event.stopPropagation()
    event.preventDefault()
    stop()
  }
  // Some browsers send no click after a long press; the next gesture then starts clean.
  const stop = () => {
    window.removeEventListener('click', swallow, true)
    window.removeEventListener('pointerdown', stop, true)
  }
  window.addEventListener('click', swallow, true)
  window.addEventListener('pointerdown', stop, true)
}

function onPointerDown(event) {
  lastPointerType = event.pointerType
  // A second finger is a pinch, not a hold.
  if (holdStart && event.pointerId !== holdStart.id) return cancelHold()
  const key = event.target.closest('[data-key]')?.dataset.key
  cancelHold()
  // A mouse selects with a right-click instead.
  if (!key || event.pointerType === 'mouse' || !event.isPrimary) return
  holdStart = { id: event.pointerId, x: event.clientX, y: event.clientY }
  window.addEventListener('pointermove', onHoldMove)
  window.addEventListener('pointerup', cancelHold)
  window.addEventListener('pointercancel', cancelHold)
  holdTimer = setTimeout(() => {
    cancelHold()
    swallowNextClick()
    navigator.vibrate?.(10)
    select(key, true)
  }, HOLD_MS)
}

function onHoldMove(event) {
  if (!holdStart || event.pointerId !== holdStart.id) return
  if (Math.hypot(event.clientX - holdStart.x, event.clientY - holdStart.y) > 10) cancelHold()
}

function onClick(event) {
  // The retry button on a page that failed to load is its own action.
  if (event.target.closest('button')) return
  // A click with no pointer behind it (a screen reader activating an ayah's button) opens the ayah's menu.
  const key = event.target.closest('[data-key]')?.dataset.key
  if (key && event.detail === 0) return select(key)
  emit('tap')
}

// A right-click on an ayah opens the page's own menu, not the browser's.
function onContextMenu(event) {
  event.preventDefault()
  if (lastPointerType !== 'mouse') return
  const key = event.target.closest('[data-key]')?.dataset.key
  if (key) select(key, true)
}

function onKeydown(event) {
  const key = event.target.dataset?.key
  if (!key || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  select(key)
}

// `pointer`: chosen by a hold or a right-click, which the reader drops if that gesture also turned the page.
const select = (key, pointer = false) => emit('select', { key, text: data.value.verses[key], pointer })

onBeforeUnmount(() => {
  cancelHold()
  clearTimeout(slowTimer)
})
</script>

<template>
  <!-- The whole page takes the taps, margins included, so the bars come back from anywhere. -->
  <article
    class="mushaf-page"
    :aria-label="`صفحة ${toArabicNumerals(page)}`"
    @pointerdown="onPointerDown"
    @click="onClick"
    @keydown="onKeydown"
    @contextmenu="onContextMenu"
  >
    <div v-if="data" class="mushaf-sheet" :class="{ 'is-opening': page <= 2 }" :style="{ '--page-font': fontFamily }">
      <!-- Not a <header>: a second banner landmark on the screen would tell a screen reader nothing. -->
      <div class="mushaf-sheet__meta">
        <span>{{ headerSurah }}</span>
        <span>الجزء {{ toArabicNumerals(data.juz) }}</span>
      </div>

      <div class="mushaf-sheet__lines">
        <template v-for="(line, index) in lines" :key="index">
          <div v-if="line.surah" class="mushaf-line mushaf-line--surah" role="heading" aria-level="2">
            <span class="visually-hidden">
              سورة {{ surahName(line.surah) }}، {{ surahInfo(line.surah).place }}،
              {{ formatAyahCount(surahInfo(line.surah).ayahs) }}
            </span>
            <span class="surah-frame" aria-hidden="true">&#xFC20;</span>
            <span
              class="surah-title"
              dir="rtl"
              aria-hidden="true"
              :style="{ transform: `translate(${titleOffsets.get(line.surah) ?? 0}em, 0.079em)` }"
            >
              <span>surah</span>
              <span>{{ surahNumber(line.surah) }}</span>
            </span>
            <!-- The frame's two medallions: where the surah was revealed on the right, its ayat on the left. -->
            <span class="surah-medallion surah-medallion--start" aria-hidden="true">{{
              surahInfo(line.surah).place
            }}</span>
            <span class="surah-medallion surah-medallion--end" aria-hidden="true">{{
              toArabicNumerals(surahInfo(line.surah).ayahs)
            }}</span>
          </div>

          <div v-else-if="line.basmala" class="mushaf-line mushaf-line--basmala">
            <span class="visually-hidden">بسم الله الرحمن الرحيم</span>
            <span class="basmala" aria-hidden="true">&#xFB51;&#xFB52;&#xFB53;</span>
          </div>

          <div v-else class="mushaf-line" :class="{ 'is-centered': line.centered }">
            <template v-for="(segment, i) in line.segments" :key="i">
              <span
                class="ayah"
                :class="markOf(segment.key)"
                :data-key="segment.key"
                :role="segment.first ? 'button' : undefined"
                :tabindex="segment.first ? 0 : undefined"
                :aria-label="segment.first ? ayahLabel(segment.key) : undefined"
                :aria-hidden="segment.first ? undefined : 'true'"
                >{{ segment.glyphs }}</span>{{ i < line.segments.length - 1 ? ' ' : '' }}
            </template>
          </div>
        </template>
      </div>

      <div class="mushaf-sheet__number">{{ toArabicNumerals(page) }}</div>
    </div>

    <LoadingState v-else-if="slow && !failed" message="جاري تحميل الصفحة..." />

    <div v-else-if="failed" class="mushaf-page__state">
      <!-- Which page this is, from the index the app carries, so a page not downloaded still says where it is. -->
      <p class="mushaf-page__where">
        صفحة {{ toArabicNumerals(page) }}، {{ plainSurahName(surahOfPage(page)) }}، الجزء
        {{ toArabicNumerals(juzOfPage(page)) }}
      </p>
      <p>{{ online ? 'تعذّر تحميل الصفحة' : 'هذه الصفحة غير محمّلة، اتصل بالإنترنت لعرضها' }}</p>
      <button v-if="online" type="button" class="btn btn-soft d-inline-flex align-items-center gap-2" @click="load">
        <IconRefresh size="18" aria-hidden="true" />
        <span>إعادة المحاولة</span>
      </button>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@font-face {
  font-family: 'Mushaf Headings';
  font-display: block;
  src: url('@/features/quran/assets/fonts/mushaf-headings.woff2') format('woff2');
}

@font-face {
  font-family: 'Surah Names';
  font-display: block;
  src: url('@/features/quran/assets/fonts/surah-names.woff2') format('woff2');
}

.mushaf-page {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  // Room for the notch and home indicator; the bars float over the rest.
  padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 0.75rem
    calc(env(safe-area-inset-bottom, 0px) + 0.5rem + var(--player-room));
  --player-room: 0px;
}

/* On desktop a tap doesn't hide the player, so the page stops above it: the pill is 3.25rem tall, 0.75rem up. */
@media (min-width: 992px) {
  .mushaf-page {
    --player-room: 4rem;
  }
}

/* The page is sized to the screen: as wide as a full line allows, unless fifteen lines would then run too tall.
   Measured across all 604 pages, a line's words come to 15.6em on average and 16.4em at most (page 254, line 7),
   so a 16.6em line fits every one, with the rest of each line going to the spaces between words. */
.mushaf-sheet {
  --line-width: 16.6em;
  --pitch: clamp(1.85em, calc((100cqh - 96px - var(--player-room)) / 15), 2.5em);

  display: flex;
  flex-direction: column;
  width: var(--line-width);
  font-size: min(calc((100cqw - 24px) / 16.6), calc((100cqh - 96px - var(--player-room)) / 28));
  color: var(--bs-body-color);
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

.mushaf-sheet__meta,
.mushaf-sheet__number {
  font-family: var(--bs-body-font-family);
  font-size: 0.8125rem;
  color: var(--bs-secondary-color);
}

.mushaf-sheet__meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.mushaf-sheet__number {
  margin-top: 0.25rem;
  text-align: center;
}

.mushaf-sheet__lines {
  font-family: var(--page-font), 'Thmanyah Sans', sans-serif;
}

.mushaf-line {
  height: var(--pitch);
  line-height: var(--pitch);
  // Justified like the printed page: the spaces between words stretch so every full line meets both margins.
  text-align: justify;
  text-align-last: justify;
  white-space: nowrap;
  // The spaces come from the app font (the page fonts have none) and start at nothing; justifying sets their width.
  word-spacing: -0.25em;

  // A centred line isn't stretched, so its words get an ordinary gap.
  &.is-centered {
    text-align-last: center;
    word-spacing: -0.13em;
  }
}

.is-opening .mushaf-sheet__lines {
  // The opening pages sit in the middle of the page, like the printed Mushaf.
  padding-block: calc(var(--pitch) * 3.5);
}

.is-opening .mushaf-line {
  text-align-last: center;
  word-spacing: -0.13em;
}

.mushaf-line--surah {
  position: relative;
  display: grid;
  place-items: center;
}

.surah-frame {
  // The frame glyph is 8em wide; this makes it as wide as the page.
  font-family: 'Mushaf Headings';
  font-size: calc(var(--line-width) / 8);
  line-height: 1;
  color: color-mix(in srgb, var(--bs-primary) 60%, var(--bs-body-color));
}

.surah-title {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  font-family: 'Surah Names';
  font-size: 1.15em;
  line-height: var(--pitch);
}

.surah-medallion {
  position: absolute;
  top: 50%;
  font-family: var(--bs-body-font-family);
  // A medallion is about 1.2em of the page across: the count gets 0.44em, "مدنية" fits in it at 0.38em.
  font-size: calc(var(--medallion-scale) * 1em);
  font-weight: 700;
  line-height: 1;
  color: color-mix(in srgb, var(--bs-primary) 60%, var(--bs-body-color));
  // Centred on the frame's medallions, measured from the glyph: 20.9% in from the right end and 20.7% from the left.
  // The frame's ink sits 0.044 of its size (0.091em of the page) below the middle of its box.
  // Physical sides, so rtlcss leaves them.
  /*! rtl:begin:ignore */
  right: var(--medallion-at);
  transform: translate(50%, calc(-50% + 0.091em / var(--medallion-scale)));
  /*! rtl:end:ignore */

  &--start {
    --medallion-at: 20.94%;
    --medallion-scale: 0.38;
  }

  &--end {
    --medallion-at: 79.31%;
    --medallion-scale: 0.44;
  }
}

.mushaf-line--basmala {
  text-align: center;
  text-align-last: center;
}

.basmala {
  font-family: 'Mushaf Headings';
  font-size: 1.05em;
  word-spacing: normal;
}

.ayah {
  border-radius: 0.35em;
  cursor: default;
  transition: background-color 0.2s ease;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;

  &.is-selected,
  &.is-playing,
  &.is-bookmarked {
    --reach-before: 0.15em;
    --reach-after: 0.15em;

    background-color: var(--mark);
    // A little past the words on either side without moving them: before the ayah on its right, after it on its left.
    // Physical sides, so rtlcss leaves them.
    /*! rtl:begin:ignore */
    box-shadow:
      var(--reach-before) 0 0 var(--mark),
      calc(var(--reach-after) * -1) 0 0 var(--mark);
    /*! rtl:end:ignore */
  }

  // Two marked ayat side by side stop at the space between them: reaching into each other, their tints would mix
  // into a stripe of a third colour.
  &:is(.is-selected, .is-playing, .is-bookmarked) + &:is(.is-selected, .is-playing, .is-bookmarked) {
    --reach-before: 0em;
  }

  &:is(.is-selected, .is-playing, .is-bookmarked):has(+ :is(.is-selected, .is-playing, .is-bookmarked)) {
    --reach-after: 0em;
  }

  &.is-playing {
    --mark: var(--app-tint);
  }

  &.is-selected {
    --mark: var(--app-tint-strong);
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: 2px;
  }
}

.mushaf-page__state {
  display: grid;
  justify-items: center;
  gap: 1rem;
  max-width: 18rem;
  text-align: center;
  color: var(--bs-secondary-color);

  p {
    margin: 0;
  }
}

.mushaf-page__where {
  font-weight: 600;
  color: var(--bs-body-color);
}
</style>
