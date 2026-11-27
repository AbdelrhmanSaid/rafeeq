<script setup>
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useDebounceFn, useEventListener, useOnline, useResizeObserver } from '@vueuse/core'
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
// The page in view, which changes as soon as a swipe passes halfway; the route follows once the swipe settles.
const current = ref(routePage.value)
const pages = Array.from({ length: PAGE_COUNT }, (_, i) => i + 1)
// Only the pages either side of the one in view are drawn; the rest are empty slots of the same width.
const isNear = (page) => Math.abs(page - current.value) <= 1

const pager = useTemplateRef('pager')

// Page 1 sits at the right edge and later pages to its left, so the next page comes in with a swipe to the right, as
// a printed Mushaf turns. The width is the exact one, not clientWidth: a page can be a fraction of a pixel wide
// (392.73px on some phones), and rounding it would drift a whole page off by page 300.
const pageWidth = () => pager.value.getBoundingClientRect().width

function scrollToPage(page, behavior = 'instant') {
  if (pager.value) pager.value.scrollTo({ left: -(page - 1) * pageWidth(), behavior })
}

const pageInView = () => clampPage(Math.round(Math.abs(pager.value.scrollLeft) / pageWidth()) + 1)

let frame = 0
function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    current.value = pageInView()
    settle()
  })
}

const settle = useDebounceFn(() => {
  const page = pageInView()
  quranStore.lastPage = page
  keepPagesNear(page)
  if (page !== routePage.value) showPageInAddress(page)
}, 150)

// The address follows the page in view. An embed keeps its /embed address and its theme query, which a named route
// would drop.
function showPageInAddress(page) {
  const query = { ...route.query, ayah: undefined }
  const base = route.path.startsWith('/embed') ? '/embed' : ''
  router.replace({ path: `${base}/quran/page/${page}`, query })
}

onMounted(() => {
  scrollToPage(current.value)
  quranStore.lastPage = current.value
})

// Turning the phone or resizing the window keeps the same page in view. Only the width matters: a phone's toolbar
// sliding away changes the height mid-swipe, and snapping then would fight the finger.
let pagerWidth = 0
useResizeObserver(pager, ([entry]) => {
  const width = entry.contentRect.width
  if (width === pagerWidth) return
  pagerWidth = width
  scrollToPage(current.value)
})

// Opening another page from outside (a bookmark, say) while the reader is open.
watch(routePage, (page) => {
  if (page === current.value) return
  current.value = page
  scrollToPage(page)
})

function turnTo(page) {
  if (page >= 1 && page <= PAGE_COUNT) scrollToPage(page, 'smooth')
}

const sheetOpen = computed(() => Boolean(selected.value || tafseerAyah.value))

// Arrow keys turn pages the way they point on a right-to-left page.
useEventListener(window, 'keydown', (event) => {
  if (sheetOpen.value || event.target.closest?.('input, textarea, [role="radiogroup"]')) return
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

// A tap shows or hides the bars, or lets go of a selected ayah.
function onTap() {
  if (selected.value) selected.value = null
  else toggleChrome()
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
    <div ref="pager" class="reader__pager" dir="rtl" @scroll.passive="onScroll">
      <section v-for="page in pages" :key="page" class="reader__slot" :aria-hidden="page !== current || undefined">
        <MushafPage
          v-if="isNear(page)"
          :page="page"
          :selected-key="highlightKey"
          :playing-key="recitation.playingKey.value"
          :bookmarks="bookmarkColors"
          @tap="onTap"
          @select="onSelect"
        />
      </section>
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
  display: flex;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.reader__slot {
  flex: 0 0 100%;
  height: 100%;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  container-type: size;
}
</style>
