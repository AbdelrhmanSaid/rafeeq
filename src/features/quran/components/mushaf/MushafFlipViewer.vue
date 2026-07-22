<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useEventListener } from '@vueuse/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import MushafPage from './MushafPage.vue'
import { useMushafNavigation } from '@/features/quran/composables/useMushafNavigation'

const props = defineProps({
  pages: { type: Array, required: true },
  surahId: { type: Number, required: true },
  surahName: { type: String, required: true },
  readyPages: { type: Set, required: true },
  failedPages: { type: Set, required: true },
  surahNamesReady: { type: Boolean, default: false },
  currentAyah: { type: Number, default: null },
  bookmarkedAyah: { type: Number, default: null },
})

const emit = defineEmits(['select'])

const strip = ref(null)
const { visiblePage, isAutoNavigating, goToPage, observePages } = useMushafNavigation({
  containerRef: strip,
  horizontal: true,
})

const activeIndex = computed(() => {
  const index = props.pages.findIndex((p) => p.page === visiblePage.value)
  return index === -1 ? 0 : index
})

// Only slides near the viewport mount real pages; the rest keep an
// equally-sized placeholder so snap geometry never shifts.
const isNear = (index) => Math.abs(index - activeIndex.value) <= 2

const pageAyah = (page, ayah) =>
  ayah != null && page.ayahs.some((a) => a.numberInSurah === ayah) ? ayah : null

function step(delta) {
  const target = props.pages[activeIndex.value + delta]
  if (target) goToPage(target.page, { behavior: 'smooth' })
}

// RTL reading order: the next page sits visually to the left.
useEventListener(window, 'keydown', (event) => {
  if (event.target.closest?.('input, textarea, select, [contenteditable]')) return
  if (event.key === 'ArrowLeft') step(1)
  if (event.key === 'ArrowRight') step(-1)
})

watch(
  () => props.pages,
  () => nextTick(observePages)
)

defineExpose({ visiblePage, isAutoNavigating, goToPage })
</script>

<template>
  <div class="mushaf-flip">
    <div ref="strip" class="flip-strip">
      <div v-for="(page, index) in pages" :key="page.page" class="flip-slide" :data-page="page.page">
        <MushafPage
          v-if="isNear(index)"
          :page="page"
          :surah-id="surahId"
          :surah-name="surahName"
          :font-ready="readyPages.has(page.page)"
          :font-failed="failedPages.has(page.page)"
          :surah-names-ready="surahNamesReady"
          :current-ayah="pageAyah(page, currentAyah)"
          :bookmarked-ayah="pageAyah(page, bookmarkedAyah)"
          @select="emit('select', $event)"
        />
        <div v-else class="mushaf-page-placeholder" aria-hidden="true" />
      </div>
    </div>

    <button
      v-if="activeIndex < pages.length - 1"
      type="button"
      class="edge-tap edge-next"
      aria-label="الصفحة التالية"
      @click="step(1)"
    >
      <IconChevronLeft size="1.25rem" />
    </button>
    <button
      v-if="activeIndex > 0"
      type="button"
      class="edge-tap edge-prev"
      aria-label="الصفحة السابقة"
      @click="step(-1)"
    >
      <IconChevronRight size="1.25rem" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.mushaf-flip {
  position: relative;
  // A full page (61/103 ratio) must fit the viewport alongside the app
  // chrome (header, player, nav) — cap page width from the available height.
  --mushaf-page-max-inline-size: min(700px, calc((100dvh - 21rem) * 0.59));
}

.flip-strip {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.flip-slide {
  flex: 0 0 100%;
  min-inline-size: 0;
  scroll-snap-align: center;
  display: flex;
  justify-content: center;
}

.mushaf-page-placeholder {
  inline-size: 100%;
  max-inline-size: var(--mushaf-page-max-inline-size);
  aspect-ratio: 61 / 103;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius-lg);
  background-color: var(--bs-body-bg);
}

.edge-tap {
  position: absolute;
  inset-block: 0;
  inline-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--bs-secondary-color);
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }

  // Forward = the left edge in RTL reading order.
  &.edge-next {
    inset-inline-end: 0;
  }

  &.edge-prev {
    inset-inline-start: 0;
  }
}
</style>
