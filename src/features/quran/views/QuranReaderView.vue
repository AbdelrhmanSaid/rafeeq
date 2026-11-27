<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useEventListener, useMediaQuery, useOnline } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { WheelGestures } from 'wheel-gestures'

import MushafPage from '@/features/quran/components/MushafPage.vue'
import QuranPlayerPill from '@/features/quran/components/QuranPlayerPill.vue'
import AyahActionSheet from '@/features/quran/components/AyahActionSheet.vue'
import TafseerSheet from '@/features/quran/components/TafseerSheet.vue'
import { useQuranStore } from '@/features/quran/store'
import surahs from '@/features/quran/data/surahs.js'
import { useQuranBookmarks } from '@/features/quran/composables/useQuranBookmarks'
import { useMushafRecitation } from '@/features/quran/composables/useMushafRecitation'
import { useReaderBackground } from '@/features/quran/composables/useReaderBackground'
import { keepPagesNear, loadPage } from '@/features/quran/lib/mushafStorage'
import {
  PAGE_COUNT,
  ayahIndex,
  clampPage,
  nextVerse,
  pageOfAyah,
  parseVerseKey,
  plainSurahName,
  readingSurahOfPage,
  surahName,
  verseKey,
} from '@/features/quran/lib/mushaf'
import { chrome, useImmersiveChrome } from '@/layout/chrome'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { useScreenWakeLock } from '@/shared/composables/useScreenWakeLock'
import { toArabicNumerals } from '@/shared/utils/arabic'

const route = useRoute()
const router = useRouter()
const online = useOnline()
const quranStore = useQuranStore()
const { colors: bookmarkColors, setBookmark, removeBookmark } = useQuranBookmarks()
const recitation = useMushafRecitation()
const { toggle: toggleChrome } = useImmersiveChrome()

useScreenWakeLock()
useReaderBackground()

const routePage = computed(() => clampPage(route.params.page))
const current = ref(routePage.value)

// Page 1 is rightmost and later pages lie to the left, as a printed Mushaf turns.
const slots = computed(() =>
  [current.value - 1, current.value, current.value + 1].filter((page) => page >= 1 && page <= PAGE_COUNT),
)
const slotStyle = (page) => ({ transform: `translateX(${(current.value - page) * 100}%)` })

const pager = useTemplateRef('pager')
const track = useTemplateRef('track')

// A custom pager, since native scroll snapping lets a fast flick fly past several pages.
let offset = 0
let finishTurn = null
let cancelTurn = null

function moveTrack(x, animate) {
  offset = x
  if (!track.value) return
  track.value.style.transition = animate ? 'transform 0.32s var(--app-ease-out)' : 'none'
  track.value.style.transform = `translateX(${x}px)`
}

const pageWidth = () => pager.value?.getBoundingClientRect().width || window.innerWidth

function prefetchAround(page) {
  for (const near of [page + 1, page - 1, page + 2, page - 2]) {
    if (near >= 1 && near <= PAGE_COUNT) loadPage(near).catch(() => {})
  }
}

function settleOn(page) {
  current.value = page
  prefetchAround(page)
  // Reset now, not after the slots re-render, so a turn that follows at once slides from here.
  moveTrack(0, false)
  quranStore.lastPage = page
  keepPagesNear(page)
  if (page !== routePage.value) showPageInAddress(page)
}

function settleTurn() {
  if (!finishTurn) return
  finishTurn()
  // Force a reflow so the reset applies before another slide starts, or that slide runs on from where this one stopped.
  void track.value?.offsetWidth
}

function turnTo(page) {
  settleTurn()
  if (page < 1 || page > PAGE_COUNT || page === current.value) return
  if (Math.abs(page - current.value) !== 1 || reducedMotion.value) return settleOn(page)
  moveTrack((page - current.value) * pageWidth(), true)
  const stop = () => {
    clearTimeout(fallback)
    track.value?.removeEventListener('transitionend', done)
    finishTurn = cancelTurn = null
  }
  const done = () => {
    stop()
    settleOn(page)
  }
  const fallback = setTimeout(done, 400)
  track.value?.addEventListener('transitionend', done, { once: true })
  finishTurn = done
  cancelTurn = stop
}

// Counted from where the slide in progress lands, so quick presses each turn a page.
function turnBy(delta) {
  settleTurn()
  turnTo(current.value + delta)
}

const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

let drag = null
const DRAG_START = 8

let gestureBusy = false
// Letting go is heard on the window: a pointer can end outside the pager, or on a page slot replaced under it.
const pressed = new Set()

function onPointerDown(event) {
  // A primary pointer starts a fresh gesture, in case a release was missed.
  if (event.isPrimary) pressed.clear()
  pressed.add(event.pointerId)
  if (pressed.size > 1) {
    gestureBusy = true
    if (drag?.active) moveTrack(0, true)
    drag = null
    return
  }
  gestureBusy = false
  drag = null
  if (event.button > 0) return
  if (finishTurn) {
    gestureBusy = true
    finishTurn()
  }
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, t: event.timeStamp, active: false, vx: 0 }
}

function onPointerMove(event) {
  if (!drag || event.pointerId !== drag.id) return
  const dx = event.clientX - drag.x
  if (!drag.active) {
    if (Math.abs(dx) < DRAG_START || Math.abs(dx) < Math.abs(event.clientY - drag.y)) return
    drag.active = true
    gestureBusy = true
    pager.value.setPointerCapture(event.pointerId)
  }
  const target = dx > 0 ? current.value + 1 : current.value - 1
  const edge = target < 1 || target > PAGE_COUNT
  drag.vx = (dx - (drag.lastDx ?? 0)) / Math.max(1, event.timeStamp - (drag.lastT ?? drag.t))
  drag.lastDx = dx
  drag.lastT = event.timeStamp
  moveTrack(edge ? dx / 4 : dx, false)
}

function onPointerUp(event) {
  if (!pressed.delete(event.pointerId)) return
  if (gestureBusy) {
    suppressClick = true
    setTimeout(() => (suppressClick = false))
  }
  if (!drag || event.pointerId !== drag.id) return
  const { active, vx } = drag
  drag = null
  if (!active) return
  const width = pageWidth()
  const far = Math.abs(offset) > width / 5 || (Math.abs(vx) > 0.4 && Math.sign(vx) === Math.sign(offset))
  const target = offset > 0 ? current.value + 1 : current.value - 1
  if (far && target >= 1 && target <= PAGE_COUNT) turnTo(target)
  else moveTrack(0, true)
}

useEventListener(window, 'pointerup', onPointerUp)
useEventListener(window, 'pointercancel', onPointerUp)

let suppressClick = false
function onClickCapture(event) {
  if (!suppressClick) return
  event.stopPropagation()
  event.preventDefault()
}

// wheel-gestures tells a trackpad swipe from its momentum, so one swipe turns at most one page.
const wheelGestures = WheelGestures({ preventWheelAction: 'x', reverseSign: false })
let gestureTurned = false

wheelGestures.on('wheel', ({ isStart, isMomentum, axisMovement: [x, y] }) => {
  if (isStart) gestureTurned = false
  if (gestureTurned || isMomentum || Math.abs(x) < 30 || Math.abs(x) < Math.abs(y)) return
  gestureTurned = true
  // Content follows the fingers: swiping right brings the next page in.
  turnBy(x < 0 ? 1 : -1)
})

onMounted(() => wheelGestures.observe(pager.value))
onBeforeUnmount(() => wheelGestures.disconnect())

// An embed keeps its /embed address and its theme query, which a named route would drop.
function showPageInAddress(page) {
  const query = { ...route.query, ayah: undefined }
  const base = route.path.startsWith('/embed') ? '/embed' : ''
  router.replace({ path: `${base}/quran/page/${page}`, query })
}

onMounted(() => {
  quranStore.lastPage = current.value
  prefetchAround(current.value)
  // Web fonts load on first use; preloading keeps a page's surah title from being drawn late.
  document.fonts.load("1em 'Mushaf Headings'").catch(() => {})
  document.fonts.load("1em 'Surah Names'").catch(() => {})
})

watch(
  () => route.params.page,
  (raw) => raw !== undefined && String(raw) !== String(routePage.value) && showPageInAddress(routePage.value),
  { immediate: true },
)

watch(routePage, (page) => {
  if (page === current.value) return
  cancelTurn?.()
  settleOn(page)
})

let disposed = false
onBeforeUnmount(() => {
  disposed = true
  cancelTurn?.()
})

const sheetOpen = computed(() => Boolean(selected.value || tafseerAyah.value))

useEventListener(window, 'keydown', (event) => {
  if (sheetOpen.value || document.querySelector('.sheet-root') || event.target.closest?.('input, textarea')) return
  if (event.key === 'ArrowLeft') turnBy(1)
  else if (event.key === 'ArrowRight') turnBy(-1)
  else return
  event.preventDefault()
})

const flashKey = ref(null)
let flashTimer = 0
function flash(key) {
  clearTimeout(flashTimer)
  flashKey.value = key
  flashTimer = setTimeout(() => (flashKey.value = null), 2500)
}
watch(
  () => route.query.ayah,
  (key) => {
    const verse = parseVerseKey(key)
    if (verse && pageOfAyah(verse.surah, verse.ayah) === routePage.value) flash(key)
  },
  { immediate: true },
)

const selected = ref(null)

function onSelect({ key, text, pointer }) {
  if (pointer && (gestureBusy || drag?.active)) return
  // The finger that held the ayah no longer drags the page under its menu.
  drag = null
  const { surah, ayah } = parseVerseKey(key)
  selected.value = { key, surah, ayah, text }
}

const isDesktop = useMediaQuery('(min-width: 992px)')
function onTap() {
  if (selected.value) selected.value = null
  else if (!isDesktop.value) toggleChrome()
}

const highlightKey = computed(() => selected.value?.key ?? flashKey.value)

function bookmark(color) {
  const { key } = selected.value
  const had = bookmarkColors.value.has(key)
  setBookmark(key, color)
  toast.success(had ? 'تم تغيير لون الإشارة المرجعية' : 'تم حفظ الإشارة المرجعية')
}

function unbookmark() {
  removeBookmark(selected.value.key)
  toast.success('تمت إزالة الإشارة المرجعية')
}

const tafseerAyah = ref(null)

function openTafseer(ayah) {
  tafseerAyah.value = { ...ayah, number: ayahIndex(ayah.surah, ayah.ayah), numberInSurah: ayah.ayah }
}

const previousVerse = ({ surah, ayah }) => {
  if (ayah > 1) return { surah, ayah: ayah - 1 }
  return surah > 1 ? { surah: surah - 1, ayah: surahs[surah - 2].numberOfAyahs } : null
}

let tafseerStep = 0
watch(tafseerAyah, (ayah) => !ayah && tafseerStep++)

async function stepTafseer(delta) {
  const step = ++tafseerStep
  const from = tafseerAyah.value
  const to = delta > 0 ? nextVerse(from.surah, from.ayah) : previousVerse(from)
  if (!to) return
  const key = verseKey(to.surah, to.ayah)
  try {
    const { data } = await loadPage(pageOfAyah(to.surah, to.ayah))
    if (step !== tafseerStep) return
    openTafseer({ key, ...to, text: data.verses[key] })
  } catch {
    toast.error('تعذر تحميل الآية')
  }
}

async function togglePlayback() {
  if (recitation.playing.value) return recitation.pause()

  const { surah: pausedSurah, ayah: pausedAyah } = recitation
  if (
    pausedSurah.value &&
    pausedAyah.value !== null &&
    pageOfAyah(pausedSurah.value, Math.max(1, pausedAyah.value)) === current.value
  ) {
    return recitation.resume()
  }

  try {
    const { data } = await loadPage(current.value)
    if (disposed) return
    const { surah, ayah } = parseVerseKey(Object.keys(data.verses)[0])
    startRecitation(surah, ayah)
  } catch {
    toast.error('تعذر تشغيل التلاوة')
  }
}

// recitedPage outlives gaps with no ayah (a Basmala, a pause), so those don't pull back a reader who turned away.
let recitedPage = null
watch(
  () => recitation.playingKey.value,
  (key) => {
    const verse = parseVerseKey(key)
    if (!verse) return
    const page = pageOfAyah(verse.surah, verse.ayah)
    const following = recitedPage === null || recitedPage === current.value
    recitedPage = page
    if (page !== current.value && following) turnTo(page)
  },
)

function startRecitation(surah, ayah) {
  recitedPage = null
  recitation.playFrom(surah, ayah)
}

const readingSurah = computed(() => plainSurahName(readingSurahOfPage(current.value)))
const pageTitle = computed(() => `سورة ${readingSurah.value} - صفحة ${toArabicNumerals(current.value)}`)

usePageMeta(() => ({
  title: pageTitle.value,
  description: `قراءة القرآن الكريم في مصحف المدينة المنورة - صفحة ${toArabicNumerals(current.value)}`,
  keywords: ['قرآن', 'مصحف', 'مصحف المدينة', readingSurah.value, 'رفيق'],
}))
</script>

<template>
  <main class="reader">
    <h1 class="visually-hidden">{{ pageTitle }}</h1>

    <div
      ref="pager"
      class="reader__pager"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @click.capture="onClickCapture"
      @dragstart.prevent
    >
      <div ref="track" class="reader__track">
        <section
          v-for="page in slots"
          :key="page"
          class="reader__slot"
          :style="slotStyle(page)"
          :inert="page !== current"
          :aria-hidden="page !== current || undefined"
        >
          <MushafPage
            :page="page"
            :selected-key="highlightKey"
            :playing-key="recitation.playingKey.value"
            :bookmarks="bookmarkColors"
            @tap="onTap"
            @select="onSelect"
          />
        </section>
      </div>
    </div>

    <div class="reader__turns">
      <button
        type="button"
        class="btn btn-soft visually-hidden-focusable"
        :disabled="current >= PAGE_COUNT"
        @click="turnBy(1)"
      >
        الصفحة التالية
      </button>
      <button type="button" class="btn btn-soft visually-hidden-focusable" :disabled="current <= 1" @click="turnBy(-1)">
        الصفحة السابقة
      </button>
    </div>
    <p class="visually-hidden" aria-live="polite">صفحة {{ toArabicNumerals(current) }}</p>

    <QuranPlayerPill
      v-if="online || recitation.playing.value"
      :playing="recitation.playing.value"
      :loading="recitation.loading.value"
      :hidden="chrome.hidden"
      @toggle="togglePlayback"
    />

    <AyahActionSheet
      :ayah="selected"
      :surah-name="selected ? surahName(selected.surah) : ''"
      :online="online"
      :bookmark-color="selected ? (bookmarkColors.get(selected.key) ?? null) : null"
      @recite="startRecitation(selected.surah, selected.ayah)"
      @tafseer="openTafseer(selected)"
      @bookmark="bookmark"
      @unbookmark="unbookmark"
      @close="selected = null"
    />

    <TafseerSheet
      :ayah="tafseerAyah"
      :has-prev="!!tafseerAyah && tafseerAyah.number > 1"
      :has-next="!!tafseerAyah && tafseerAyah.number < 6236"
      @prev="stepTafseer(-1)"
      @next="stepTafseer(1)"
      @close="tafseerAyah = null"
    />
  </main>
</template>

<style lang="scss" scoped>
.reader {
  position: fixed;
  inset: 0;
  background-color: var(--bs-body-bg);
}

@media (min-width: 992px) {
  .reader {
    top: var(--topnav-height);
  }

  :global(.main-content-embed .reader) {
    top: 0;
  }
}

.reader__turns {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + var(--appbar-height) + 0.5rem);
  inset-inline: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 0.5rem;

  .btn {
    min-height: 2.75rem;
  }
}

.reader__pager {
  position: relative;
  height: 100%;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  touch-action: pinch-zoom;
}

.reader__track {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.reader__slot {
  position: absolute;
  inset: 0;
  overflow: hidden;
  container-type: size;
}
</style>
