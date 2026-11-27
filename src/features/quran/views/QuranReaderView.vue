<script setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useEventListener, useMediaQuery, useOnline } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import MushafPage from '@/features/quran/components/MushafPage.vue'
import QuranPlayerPill from '@/features/quran/components/QuranPlayerPill.vue'
import AyahActionSheet from '@/features/quran/components/AyahActionSheet.vue'
import TafseerSheet from '@/features/quran/components/TafseerSheet.vue'
import { useQuranStore } from '@/features/quran/store'
import surahs from '@/features/quran/data/surahs.js'
import { useQuranBookmarks } from '@/features/quran/composables/useQuranBookmarks'
import { useMushafRecitation } from '@/features/quran/composables/useMushafRecitation'
import { keepPagesNear, loadPage } from '@/features/quran/lib/mushafStorage'
import {
  PAGE_COUNT,
  ayahIndex,
  clampPage,
  nextVerse,
  pageOfAyah,
  parseVerseKey,
  surahName,
  surahOfPage,
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

const routePage = computed(() => clampPage(route.params.page))
const current = ref(routePage.value)

// Only the page in view and the one either side are drawn. Page 1 is rightmost and later pages lie to the left, so
// the next page comes in with a swipe to the right, as a printed Mushaf turns.
const slots = computed(() =>
  [current.value - 1, current.value, current.value + 1].filter((page) => page >= 1 && page <= PAGE_COUNT),
)
const slotStyle = (page) => ({ transform: `translateX(${(current.value - page) * 100}%)` })

const pager = useTemplateRef('pager')
const track = useTemplateRef('track')

// The pager turns exactly one page per drag, flick or trackpad swipe; native scrolling would let a fast flick fly
// past several pages.
let offset = 0
// Finishes the slide in progress, if any, at once.
let finishTurn = null

function moveTrack(x, animate) {
  offset = x
  if (!track.value) return
  track.value.style.transition = animate ? 'transform 0.32s var(--app-ease-out)' : 'none'
  track.value.style.transform = `translateX(${x}px)`
}

const pageWidth = () => pager.value?.getBoundingClientRect().width || window.innerWidth

function settleOn(page) {
  current.value = page
  // The slots move to their new places on the next render; the track resets with them, so nothing jumps.
  nextTick(() => moveTrack(0, false))
  quranStore.lastPage = page
  keepPagesNear(page)
  if (page !== routePage.value) showPageInAddress(page)
}

// Slides to the next or previous page; any other page is a jump.
function turnTo(page) {
  finishTurn?.()
  if (page < 1 || page > PAGE_COUNT || page === current.value) return
  if (Math.abs(page - current.value) !== 1 || reducedMotion.value) return settleOn(page)
  moveTrack((page - current.value) * pageWidth(), true)
  const done = () => {
    clearTimeout(fallback)
    track.value?.removeEventListener('transitionend', done)
    finishTurn = null
    settleOn(page)
  }
  const fallback = setTimeout(done, 400)
  track.value?.addEventListener('transitionend', done, { once: true })
  finishTurn = done
}

const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

// Dragging: the page follows the finger, then turns if it went a fifth of the way or was flicked; otherwise it
// springs back. A drag past the first or last page gives a little and returns.
let drag = null
const DRAG_START = 8

function onPointerDown(event) {
  if (event.button > 0) return
  // A new drag doesn't wait for the last page to finish sliding in.
  finishTurn?.()
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, t: event.timeStamp, active: false, vx: 0 }
}

function onPointerMove(event) {
  if (!drag || event.pointerId !== drag.id) return
  const dx = event.clientX - drag.x
  if (!drag.active) {
    if (Math.abs(dx) < DRAG_START || Math.abs(dx) < Math.abs(event.clientY - drag.y)) return
    drag.active = true
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
  if (!drag || event.pointerId !== drag.id) return
  const { active, vx } = drag
  drag = null
  if (!active) return
  // The click that follows a drag isn't a tap.
  suppressClick = true
  setTimeout(() => (suppressClick = false))
  const width = pageWidth()
  const far = Math.abs(offset) > width / 5 || (Math.abs(vx) > 0.4 && Math.sign(vx) === Math.sign(offset))
  const target = offset > 0 ? current.value + 1 : current.value - 1
  if (far && target >= 1 && target <= PAGE_COUNT) turnTo(target)
  else moveTrack(0, true)
}

let suppressClick = false
function onClickCapture(event) {
  if (!suppressClick) return
  event.stopPropagation()
  event.preventDefault()
}

// A trackpad swipe turns one page, then waits for the swipe's momentum to die down before another can.
let wheelSum = 0
let wheelIdle = 0
let wheelLocked = false
function onWheel(event) {
  if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
  event.preventDefault()
  clearTimeout(wheelIdle)
  wheelIdle = setTimeout(() => {
    wheelSum = 0
    wheelLocked = false
  }, 200)
  if (wheelLocked) return
  wheelSum += event.deltaX
  if (Math.abs(wheelSum) < 40) return
  wheelLocked = true
  // Content scrolls with the fingers: swiping right (negative deltaX) brings the next page in from the left.
  turnTo(wheelSum < 0 ? current.value + 1 : current.value - 1)
}

// The address follows the page in view. An embed keeps its /embed address and its theme query, which a named route
// would drop.
function showPageInAddress(page) {
  const query = { ...route.query, ayah: undefined }
  const base = route.path.startsWith('/embed') ? '/embed' : ''
  router.replace({ path: `${base}/quran/page/${page}`, query })
}

onMounted(() => (quranStore.lastPage = current.value))

// Opening another page from outside (a bookmark, say) while the reader is open.
watch(routePage, (page) => {
  if (page !== current.value) settleOn(page)
})

const sheetOpen = computed(() => Boolean(selected.value || tafseerAyah.value))

// Arrow keys turn pages the way they point on a right-to-left page; not while a sheet is open over the page.
useEventListener(window, 'keydown', (event) => {
  if (sheetOpen.value || document.querySelector('.sheet-root') || event.target.closest?.('input, textarea')) return
  if (event.key === 'ArrowLeft') turnTo(current.value + 1)
  else if (event.key === 'ArrowRight') turnTo(current.value - 1)
  else return
  event.preventDefault()
})

// An ayah opened from a bookmark or a link glows for a moment.
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

function onSelect({ key, text }) {
  const { surah, ayah } = parseVerseKey(key)
  selected.value = { key, surah, ayah, text }
}

// A tap shows or hides the bars, or lets go of a selected ayah. On desktop the top nav stays, so taps leave the bars be.
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

// The tafsir sheet steps through the ayat on its own, loading each one's text from its page.
const tafseerAyah = ref(null)

function openTafseer(ayah) {
  tafseerAyah.value = { ...ayah, number: ayahIndex(ayah.surah, ayah.ayah), numberInSurah: ayah.ayah }
}

const previousVerse = ({ surah, ayah }) => {
  if (ayah > 1) return { surah, ayah: ayah - 1 }
  return surah > 1 ? { surah: surah - 1, ayah: surahs[surah - 2].numberOfAyahs } : null
}

async function stepTafseer(delta) {
  const from = tafseerAyah.value
  const to = delta > 0 ? nextVerse(from.surah, from.ayah) : previousVerse(from)
  if (!to) return
  const key = verseKey(to.surah, to.ayah)
  try {
    const { data } = await loadPage(pageOfAyah(to.surah, to.ayah))
    openTafseer({ key, ...to, text: data.verses[key] })
  } catch {
    toast.error('تعذر تحميل الآية')
  }
}

// Play starts from the top of the page in view, or carries on where it was paused if that's on this page.
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
    const { surah, ayah } = parseVerseKey(Object.keys(data.verses)[0])
    startRecitation(surah, ayah)
  } catch {
    toast.error('تعذر تشغيل التلاوة')
  }
}

// The page turns with the recitation, unless the reader has gone to read somewhere else meanwhile. The last page
// recited is remembered through the gaps with no ayah (a Basmala, a pause), so those don't pull the reader back.
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

// Playing from a chosen ayah or page is following it.
function startRecitation(surah, ayah) {
  recitedPage = null
  recitation.playFrom(surah, ayah)
}

usePageMeta(() => ({
  title: `سورة ${surahName(surahOfPage(routePage.value))} - صفحة ${toArabicNumerals(routePage.value)}`,
  description: `قراءة القرآن الكريم في مصحف المدينة المنورة - صفحة ${toArabicNumerals(routePage.value)}`,
  keywords: ['قرآن', 'مصحف', 'مصحف المدينة', surahName(surahOfPage(routePage.value)), 'رفيق'],
}))
</script>

<template>
  <div class="reader">
    <div
      ref="pager"
      class="reader__pager"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @click.capture="onClickCapture"
      @wheel="onWheel"
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
  </div>
</template>

<style lang="scss" scoped>
/* The page fills the screen; the app bar, tab bar and player float over it. */
.reader {
  position: fixed;
  inset: 0;
  background-color: var(--bs-body-bg);
}

@media (min-width: 992px) {
  .reader {
    top: var(--topnav-height);
  }
}

.reader__pager {
  position: relative;
  height: 100%;
  overflow: hidden;
  // A mouse drag turns the page rather than selecting text.
  -webkit-user-select: none;
  user-select: none;
  // The pager handles horizontal drags itself; nothing on the page scrolls.
  touch-action: none;
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
