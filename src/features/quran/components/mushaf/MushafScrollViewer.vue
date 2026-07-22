<script setup>
import { ref, watch, nextTick } from 'vue'
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

const stack = ref(null)
const { visiblePage, isAutoNavigating, goToPage, observePages } = useMushafNavigation({
  containerRef: stack,
})

const pageAyah = (page, ayah) =>
  ayah != null && page.ayahs.some((a) => a.numberInSurah === ayah) ? ayah : null

watch(
  () => props.pages,
  () => nextTick(observePages)
)

defineExpose({ visiblePage, isAutoNavigating, goToPage })
</script>

<template>
  <div ref="stack" class="mushaf-stack">
    <div v-for="page in pages" :key="page.page" class="stack-item" :data-page="page.page">
      <MushafPage
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mushaf-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stack-item {
  // Off-screen pages skip layout/paint; the placeholder size keeps scroll
  // geometry stable (700px page ≈ 1180px tall at the 61/103 ratio).
  content-visibility: auto;
  contain-intrinsic-size: auto 1180px;
}
</style>
