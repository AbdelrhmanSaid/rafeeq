<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-vue'
import { useOnline } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useRouteParams } from '@vueuse/router'
import { toast } from 'vue-sonner'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import AsyncContent from '@/shared/ui/AsyncContent.vue'
import AudioPlayer from '@/features/quran/components/QuranPlayer.vue'
import AyahActionSheet from '@/features/quran/components/AyahActionSheet.vue'
import TafseerSheet from '@/features/quran/components/TafseerSheet.vue'
import MushafViewer from '@/features/quran/components/mushaf/MushafViewer.vue'
import { useQuranStore } from '@/features/quran/store'
import { useQuranBookmark } from '@/features/quran/composables/useQuranBookmark'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { toArabicNumerals, normalizeQuranicText } from '@/shared/utils/arabic'
import { fetchSurah } from '@/features/quran/api'

const online = useOnline()
const route = useRoute()
const surahId = useRouteParams('surah')
const quranStore = useQuranStore()
const { bookmark, isBookmarked, toggleBookmark } = useQuranBookmark()
const playerRef = ref(null)
const mushafRef = ref(null)

const {
  data: surah,
  error,
  pending: isFetching,
  execute: reloadSurah,
} = useAsyncData(async () => {
  const result = await fetchSurah(surahId.value)
  if (online.value && result) {
    // The player renders this name in UI fonts, which lack some Quranic
    // annotation glyphs present in the payload's name.
    await quranStore.loadSurahAudio(result.id, normalizeQuranicText(result.name))
  }
  return result
})

// Vue Router reuses this component when only the :surah param changes (e.g. the
// prev/next buttons), so re-fetch and scroll back to the top on each switch.
watch(surahId, () => {
  reloadSurah()
  window.scrollTo({ top: 0 })
})

const revelationLabel = computed(() => (surah.value?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'))
const surahNumber = computed(() => Number(surahId.value))

usePageMeta(
  () =>
    surah.value && {
      title: surah.value.name,
      description: `قراءة وتلاوة سورة ${surah.value.name} - ${toArabicNumerals(surah.value.numberOfAyahs)} آية - سورة ${revelationLabel.value}`,
      keywords: ['قرآن', 'سورة', surah.value.name, 'تلاوة', 'قراءة', 'رفيق'],
    },
)

const activeAyah = ref(null)
const tafseerAyah = ref(null)

const selectAyah = (ayahNumber) => {
  activeAyah.value = surah.value?.ayahs.find((a) => a.numberInSurah === ayahNumber) ?? null
}

// Navigate the tafseer sheet through the surah's ayat without leaving the sheet.
const tafseerIndex = computed(() =>
  (surah.value?.ayahs ?? []).findIndex((a) => a.number === tafseerAyah.value?.number),
)

const stepTafseer = (delta) => {
  const next = surah.value?.ayahs[tafseerIndex.value + delta]
  if (next) tafseerAyah.value = next
}

const reciteAyah = () => {
  playerRef.value?.seekToAyah(activeAyah.value?.numberInSurah)
}

const bookmarkedAyahNumber = computed(() =>
  bookmark.value && surah.value && bookmark.value.surahId === surah.value.id
    ? bookmark.value.ayahNumber
    : null,
)

const handleBookmark = () => {
  const ayah = activeAyah.value
  if (!ayah || !surah.value) return

  const wasBookmarked = isBookmarked(surah.value.id, ayah.numberInSurah)
  toggleBookmark({
    surahId: surah.value.id,
    surahName: surah.value.name,
    ayahNumber: ayah.numberInSurah,
    text: ayah.text,
  })
  toast.success(wasBookmarked ? 'تمت إزالة الإشارة المرجعية' : 'تم حفظ الإشارة المرجعية')
}

// When arriving with ?ayah=N (e.g. from the bookmark card), open the mushaf
// on that ayah's page once the surah has rendered.
watch(
  [surah, () => route.query.ayah],
  ([loadedSurah, ayahQuery]) => {
    if (!loadedSurah || !ayahQuery) return
    nextTick(() => mushafRef.value?.goToAyah(Number(ayahQuery), { behavior: 'instant' }))
  },
  { immediate: true },
)
</script>

<template>
  <AsyncContent :pending="isFetching" :error="error" loading-message="جاري تحميل السورة...">
    <Page class="quran-page" v-if="surah">
      <Heading
        :title="normalizeQuranicText(surah.name)"
        :subtitle="`عدد الآيات: ${toArabicNumerals(surah.numberOfAyahs)} آية - سورة ${revelationLabel}`"
        :share="true"
      />

      <!-- Audio Player -->
      <AudioPlayer v-if="online" ref="playerRef" />

      <MushafViewer
        ref="mushafRef"
        :surah="surah"
        :bookmarked-ayah="bookmarkedAyahNumber"
        @select="selectAyah"
      />

      <div class="d-flex justify-content-center align-items-center gap-2">
        <RouterLink
          :to="{ name: 'quran-surah', params: { surah: surahNumber - 1 } }"
          class="btn btn-flat d-inline-flex align-items-center gap-2"
          :class="{ disabled: surahNumber === 1 }"
        >
          <IconArrowRight size="1.25rem" />
          <span>السابقة</span>
        </RouterLink>

        <BackButton :to="{ name: 'quran' }" button-class="btn-primary" />

        <RouterLink
          :to="{ name: 'quran-surah', params: { surah: surahNumber + 1 } }"
          class="btn btn-flat d-inline-flex align-items-center gap-2"
          :class="{ disabled: surahNumber === 114 }"
        >
          <span>التالية</span>
          <IconArrowLeft size="1.25rem" />
        </RouterLink>
      </div>

      <AyahActionSheet
        :ayah="activeAyah"
        :surah-name="surah.name"
        :online="online"
        :bookmarked="!!activeAyah && isBookmarked(surah.id, activeAyah.numberInSurah)"
        @recite="reciteAyah"
        @tafseer="tafseerAyah = activeAyah"
        @bookmark="handleBookmark"
        @close="activeAyah = null"
      />

      <TafseerSheet
        :ayah="tafseerAyah"
        :has-prev="tafseerIndex > 0"
        :has-next="tafseerIndex >= 0 && tafseerIndex < surah.ayahs.length - 1"
        @prev="stepTafseer(-1)"
        @next="stepTafseer(1)"
        @close="tafseerAyah = null"
      />
    </Page>
  </AsyncContent>
</template>

<style lang="scss" scoped>
.quran-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 700px;
}
</style>
