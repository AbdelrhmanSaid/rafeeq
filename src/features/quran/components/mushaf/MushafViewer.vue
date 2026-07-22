<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { IconBook, IconArrowAutofitDown, IconPlayerTrackPrev } from '@tabler/icons-vue'
import MushafFlipViewer from './MushafFlipViewer.vue'
import MushafScrollViewer from './MushafScrollViewer.vue'
import { useQuranStore } from '@/features/quran/store'
import { useMushafLayout } from '@/features/quran/composables/useMushafLayout'
import { useQcfPageFonts } from '@/features/quran/composables/useQcfPageFonts'
import { useMushafFollow } from '@/features/quran/composables/useMushafFollow'
import { toArabicNumerals } from '@/shared/utils/arabic'

const props = defineProps({
  surah: { type: Object, required: true },
  bookmarkedAyah: { type: Number, default: null },
})

const emit = defineEmits(['select'])

const quranStore = useQuranStore()
const viewerRef = ref(null)

const pages = useMushafLayout(() => props.surah)
const { readyPages, failedPages, surahNamesReady, prioritize } = useQcfPageFonts(() => props.surah.pages)

const ayahPage = computed(() => {
  const map = new Map()
  for (const ayah of props.surah.ayahs) map.set(ayah.numberInSurah, ayah.page)
  return map
})
const pageOfAyah = (ayah) => ayahPage.value.get(ayah) ?? null

const visiblePage = computed(() => viewerRef.value?.visiblePage ?? null)
const isAutoNavigating = computed(() => viewerRef.value?.isAutoNavigating ?? false)
const goToPage = (page, options) => viewerRef.value?.goToPage(page, options)
const goToAyah = (ayah, options = {}) => {
  const page = pageOfAyah(ayah)
  if (page != null) goToPage(page, { ...options, ayah })
}

const { suspended, resume, currentAyahNumber } = useMushafFollow({
  surahNumber: () => props.surah.id,
  visiblePage,
  isAutoNavigating,
  goToPage,
  pageOfAyah,
})

// The visible page's font jumps the sequential loading queue.
watch(visiblePage, (page) => {
  if (page != null) prioritize([page])
})

const activeViewer = computed(() => (quranStore.mushafLayout === 'scroll' ? MushafScrollViewer : MushafFlipViewer))

// Keep the reader's place when toggling between layouts (the viewer remounts).
watch(
  () => quranStore.mushafLayout,
  () => {
    const page = visiblePage.value
    if (page != null) nextTick(() => goToPage(page, { behavior: 'instant' }))
  },
)

function toggleLayout() {
  quranStore.mushafLayout = quranStore.mushafLayout === 'flip' ? 'scroll' : 'flip'
}

defineExpose({ goToAyah, goToPage })
</script>

<template>
  <div class="mushaf-viewer">
    <div class="mushaf-toolbar">
      <span class="page-indicator">
        صفحة {{ toArabicNumerals(visiblePage ?? surah.pages[0]) }} من {{ toArabicNumerals(604) }}
      </span>
      <button type="button" class="btn btn-flat btn-sm d-inline-flex align-items-center gap-2" @click="toggleLayout">
        <IconArrowAutofitDown v-if="quranStore.mushafLayout === 'flip'" size="1rem" />
        <IconBook v-else size="1rem" />
        <span>{{ quranStore.mushafLayout === 'flip' ? 'تمرير عمودي' : 'تقليب الصفحات' }}</span>
      </button>
    </div>

    <component
      :is="activeViewer"
      ref="viewerRef"
      :pages="pages"
      :surah-id="surah.id"
      :surah-name="surah.name"
      :ready-pages="readyPages"
      :failed-pages="failedPages"
      :surah-names-ready="surahNamesReady"
      :current-ayah="currentAyahNumber"
      :bookmarked-ayah="bookmarkedAyah"
      @select="emit('select', $event)"
    />

    <Transition name="fade">
      <button v-if="suspended" type="button" class="resume-chip btn btn-primary" @click="resume">
        <IconPlayerTrackPrev size="1rem" />
        <span>متابعة التلاوة</span>
      </button>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.mushaf-viewer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mushaf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .page-indicator {
    font-size: 0.875rem;
    color: var(--bs-secondary-color);
  }
}

.resume-chip {
  position: fixed;
  inset-block-end: 1.25rem;
  inset-inline-start: 50%;
  translate: 50% 0;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--bs-border-radius-pill);
  box-shadow: var(--bs-box-shadow);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
