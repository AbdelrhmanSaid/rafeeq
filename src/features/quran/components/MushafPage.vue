<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef, useTemplateRef, watch } from 'vue'
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

// About one line in forty of the V4 fonts comes out wider than the page (up to a third wider); once drawn, those are
// set smaller to fit. Everything is in em, so the ratio holds at any size.
const linesBox = useTemplateRef('linesBox')
watch(data, async () => {
  await nextTick()
  for (const line of linesBox.value?.querySelectorAll('.mushaf-line--text') ?? []) {
    line.style.removeProperty('--fit')
    if (!line.clientWidth) continue
    const over = line.scrollWidth / line.clientWidth
    if (over > 1.002) line.style.setProperty('--fit', (1 / over).toFixed(4))
  }
})
watch(online, (isOnline) => isOnline && failed.value && load())

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
const bannerSurahs = computed(() => lines.value.filter((line) => line.surah).map((line) => line.surah))

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

// Centre the visible ink of each label within its part of the frame. The title has two runs with a 0.3em gap.
// Canvas measures at 100px, so dividing the centre difference by 100 gives the shift in em at any display size.
function inkOffset(first, second) {
  const last = second ?? first
  const advance = second ? first.width + 30 : 0
  const width = advance + last.width
  const left = -first.actualBoundingBoxLeft
  const right = advance + last.actualBoundingBoxRight
  const ascent = Math.max(first.actualBoundingBoxAscent, last.actualBoundingBoxAscent)
  const descent = Math.max(first.actualBoundingBoxDescent, last.actualBoundingBoxDescent)
  return {
    '--ink-x': `${(width - left - right) / 200}em`,
    '--ink-y': `${(ascent - descent - first.fontBoundingBoxAscent + first.fontBoundingBoxDescent) / 200}em`,
  }
}

const bannerStyles = reactive(new Map())

async function centreBannerLabels(surahIds) {
  const pending = surahIds.filter((id) => !bannerStyles.has(id))
  if (!pending.length || typeof document === 'undefined' || !document.fonts) return
  const titleFont = "100px 'Surah Names'"
  const medallionFont = "700 100px 'Thmanyah Sans'"
  try {
    await Promise.all([document.fonts.load(titleFont), document.fonts.load(medallionFont)])
  } catch {
    return
  }
  const context = document.createElement('canvas').getContext('2d')
  if (!context) return
  context.textAlign = 'left'
  for (const id of pending) {
    const { place, ayahs } = surahInfo(id)
    context.font = titleFont
    context.direction = 'ltr'
    const title = inkOffset(context.measureText(surahNumber(id)), context.measureText('surah'))
    context.font = medallionFont
    context.direction = 'rtl'
    bannerStyles.set(id, {
      title,
      place: inkOffset(context.measureText(place)),
      count: inkOffset(context.measureText(toArabicNumerals(ayahs))),
    })
  }
}

watch(bannerSurahs, centreBannerLabels)

// The pager captures the pointer once a drag starts, so the hold listens for moves and release on the window.
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

// The click ending a hold isn't a tap, and may land on the backdrop of the ayah's menu, which would close it.
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
  if (event.target.closest('button')) return
  // A click with no pointer behind it (a screen reader activating an ayah's button) opens the ayah's menu.
  const key = event.target.closest('[data-key]')?.dataset.key
  if (key && event.detail === 0) return select(key)
  emit('tap')
}

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
    <div
      v-if="data"
      class="mushaf-sheet"
      :class="{ 'is-opening': page <= 2 }"
      :style="{ '--page-font': fontFamily, '--surah-lines': bannerSurahs.length }"
    >
      <!-- Not a <header>: a second banner landmark on the screen would tell a screen reader nothing. -->
      <div class="mushaf-sheet__meta">
        <span>{{ headerSurah }}</span>
        <span>الجزء {{ toArabicNumerals(data.juz) }}</span>
      </div>

      <div ref="linesBox" class="mushaf-sheet__lines">
        <template v-for="(line, index) in lines" :key="index">
          <div v-if="line.surah" class="mushaf-line mushaf-line--surah" role="heading" aria-level="2">
            <span class="visually-hidden">
              سورة {{ surahName(line.surah) }}، {{ surahInfo(line.surah).place }}،
              {{ formatAyahCount(surahInfo(line.surah).ayahs) }}
            </span>
            <span class="surah-frame" aria-hidden="true">&#xFC20;</span>
            <span
              class="surah-label surah-title"
              dir="rtl"
              aria-hidden="true"
              :style="bannerStyles.get(line.surah)?.title"
            >
              <span>surah</span>
              <span>{{ surahNumber(line.surah) }}</span>
            </span>
            <!-- The frame's two medallions: where the surah was revealed on the right, its ayat on the left. -->
            <span
              class="surah-label surah-medallion surah-medallion--start"
              aria-hidden="true"
              :style="bannerStyles.get(line.surah)?.place"
              >{{ surahInfo(line.surah).place }}</span
            >
            <span
              class="surah-label surah-medallion surah-medallion--end"
              aria-hidden="true"
              :style="bannerStyles.get(line.surah)?.count"
              >{{ toArabicNumerals(surahInfo(line.surah).ayahs) }}</span
            >
          </div>

          <div v-else-if="line.basmala" class="mushaf-line mushaf-line--basmala">
            <span class="visually-hidden">بسم الله الرحمن الرحيم</span>
            <span class="basmala" aria-hidden="true">&#xFB51;&#xFB52;&#xFB53;</span>
          </div>

          <div v-else class="mushaf-line mushaf-line--text" :class="{ 'is-centered': line.centered }">
            <template v-for="(segment, i) in line.segments" :key="i">
              <span
                class="ayah"
                :class="markOf(segment.key)"
                :data-key="segment.key"
                :role="segment.first ? 'button' : undefined"
                :tabindex="segment.first ? 0 : undefined"
                :aria-label="segment.first ? ayahLabel(segment.key) : undefined"
                :aria-hidden="segment.first ? undefined : 'true'"
                ><span class="ayah__glyphs">{{ segment.glyphs }}</span></span
              >{{ i < line.segments.length - 1 ? ' ' : '' }}
            </template>
          </div>
        </template>
      </div>

      <div class="mushaf-sheet__number">{{ toArabicNumerals(page) }}</div>
    </div>

    <LoadingState v-else-if="slow && !failed" message="جاري تحميل الصفحة..." />

    <div v-else-if="failed" class="mushaf-page__state">
      <!-- From the bundled index, so a page not downloaded still says where it is. -->
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

/* Across all 604 pages, a line's words come to 16.1em at the median and at most 17.2em for 97 lines in 100; the
   few wider ones are set smaller to fit (see the watch on data). */
.mushaf-sheet {
  --line-width: 17.2em;
  --page-room: calc(100cqh - 96px - var(--player-room));
  --surah-pitch: 2.65em;
  // The 2.15em frame needs a taller row than the ayat. Reserve those rows before spacing the remaining lines.
  --pitch: clamp(
    1.85em,
    calc((var(--page-room) - var(--surah-lines) * var(--surah-pitch)) / (15 - var(--surah-lines))),
    2.5em
  );

  display: flex;
  flex-direction: column;
  width: var(--line-width);
  // Each banner uses 0.8em more than a line at the minimum pitch.
  font-size: min(calc((100cqw - 24px) / 17.2), calc(var(--page-room) / (28 + var(--surah-lines) * 0.8)));
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
  // The ayat's tints sit behind the words but in front of everything under the page.
  isolation: isolate;
}

.mushaf-line {
  height: var(--pitch);
  line-height: var(--pitch);
  text-align: justify;
  text-align-last: justify;
  white-space: nowrap;
  // The spaces come from the app font (the page fonts have none). They start at a small gap (0.17em) so words never
  // touch, even on a line that fills the page or was set smaller to fit; justifying widens them from there.
  word-spacing: -0.08em;

  // Only the words shrink, so the line and the ayah around them (which the tint is measured from) keep their height.
  .ayah__glyphs {
    font-size: calc(1em * var(--fit, 1));
  }

  // A centred line isn't stretched, so its words get an ordinary gap.
  &.is-centered {
    text-align-last: center;
    word-spacing: -0.05em;
  }
}

.is-opening .mushaf-sheet__lines {
  padding-block: calc(var(--pitch) * 3.5);
}

.is-opening .mushaf-line {
  text-align-last: center;
  word-spacing: -0.05em;
}

.mushaf-line--surah {
  position: relative;
  display: grid;
  place-items: center;
  height: var(--surah-pitch);
}

.surah-frame {
  // The frame glyph is 8em wide; this makes it as wide as the page.
  font-family: 'Mushaf Headings';
  font-size: calc(var(--line-width) / 8);
  line-height: 1;
  color: color-mix(in srgb, var(--bs-primary) 60%, var(--bs-body-color));
}

.surah-label {
  position: absolute;
  top: 50%;
  font-size: calc(var(--label-scale) * 1em);
  line-height: 1;
  word-spacing: normal;
  // The frame's ink sits 0.091em (in the page font size) below the centre of its box.
  /*! rtl:begin:ignore */
  left: var(--label-at, 50%);
  transform: translate(calc(-50% + var(--ink-x, 0em)), calc(-50% + 0.091em / var(--label-scale) + var(--ink-y, 0em)));
  /*! rtl:end:ignore */
}

.surah-title {
  --label-scale: 1.15;
  display: flex;
  gap: 0.3em;
  font-family: 'Surah Names';
}

.surah-medallion {
  font-family: 'Thmanyah Sans', sans-serif;
  font-weight: 700;
  color: color-mix(in srgb, var(--bs-primary) 60%, var(--bs-body-color));
  // Each medallion is about 1.2em of the page across. The centres are measured from the frame glyph's left edge.

  &--start {
    --label-at: 79.06%;
    --label-scale: 0.38;
  }

  &--end {
    --label-at: 20.69%;
    --label-scale: 0.44;
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
  --reach-before: 0.15em;
  --reach-after: 0.15em;

  position: relative;
  cursor: default;

  // Exactly one line tall: the ayah's own box comes from the font and is taller than the line, so its background
  // would run into the lines above and below.
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: calc(50% - var(--pitch) / 2);
    height: var(--pitch);
    inset-inline: calc(var(--reach-before) * -1) calc(var(--reach-after) * -1);
    transition: background-color 0.2s ease;
  }

  &.is-selected,
  &.is-playing,
  &.is-bookmarked {
    &::before {
      background-color: var(--mark);
    }
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
