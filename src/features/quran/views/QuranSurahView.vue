<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-vue'
import { useOnline } from '@vueuse/core'
import { RouterLink, useRoute } from 'vue-router'
import { useRouteParams } from '@vueuse/router'
import { toast } from 'vue-sonner'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import AsyncContent from '@/shared/ui/AsyncContent.vue'
import AudioPlayer from '@/features/quran/components/QuranPlayer.vue'
import AyahActionSheet from '@/features/quran/components/AyahActionSheet.vue'
import TafseerSheet from '@/features/quran/components/TafseerSheet.vue'
import { Button } from '@/shared/components/ui/button'
import { useQuranStore } from '@/features/quran/store'
import { useQuranBookmark } from '@/features/quran/composables/useQuranBookmark'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { toArabicNumerals, removeBismillah, normalizeQuranicText } from '@/shared/utils/arabic'
import { fetchSurah } from '@/features/quran/api'

const online = useOnline()
const route = useRoute()
const surahId = useRouteParams('surah')
const quranStore = useQuranStore()
const { isBookmarked, toggleBookmark } = useQuranBookmark()
const playerRef = ref(null)

const {
  data: surah,
  error,
  pending: isFetching,
  execute: reloadSurah,
} = useAsyncData(async () => {
  const result = await fetchSurah(surahId.value)
  if (online.value && result) {
    await quranStore.loadSurahAudio(result.data.number, result.data.name)
  }
  return result
})

// Vue Router reuses this component when only the :surah param changes (e.g. the
// prev/next buttons), so re-fetch and scroll back to the top on each switch.
watch(surahId, () => {
  reloadSurah()
  window.scrollTo({ top: 0 })
})

const revelationLabel = computed(() => (surah.value?.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'))
const surahNumber = computed(() => Number(surahId.value))

usePageMeta(
  () =>
    surah.value && {
      title: surah.value.data.name,
      description: `قراءة وتلاوة سورة ${surah.value.data.name} - ${toArabicNumerals(surah.value.data.numberOfAyahs)} آية - سورة ${revelationLabel.value}`,
      keywords: ['قرآن', 'سورة', surah.value.data.name, 'تلاوة', 'قراءة', 'رفيق'],
    },
)

const ayat = computed(() => {
  if (surah.value) {
    let ayat = surah.value.data.ayahs

    if (surah.value.data.number === 1) {
      ayat = ayat.slice(1)
    }

    return ayat.map((ayah) => {
      const text = (ayah.numberInSurah === 1 ? removeBismillah(ayah.text) : ayah.text).trim()

      return {
        ...ayah,
        text,
      }
    })
  }

  return []
})

const activeAyah = ref(null)
const tafseerAyah = ref(null)

// Navigate the tafseer sheet through the surah's ayat without leaving the sheet.
const tafseerIndex = computed(() => ayat.value.findIndex((a) => a.number === tafseerAyah.value?.number))

const stepTafseer = (delta) => {
  const next = ayat.value[tafseerIndex.value + delta]
  if (next) tafseerAyah.value = next
}

const reciteAyah = () => {
  playerRef.value?.seekToAyah(activeAyah.value?.numberInSurah)
}

const isCurrentVerse = (verse) => {
  const currentAyah = quranStore.currentAyah
  if (!currentAyah || !surah.value) return false
  return currentAyah.ayah === verse.numberInSurah
}

const isBookmarkedVerse = (verse) => isBookmarked(surahId.value, verse.numberInSurah)

// Both highlights paint the inline text fragments, so an ayah that is bookmarked
// and playing at once shows the bookmark styling, as it did before.
const ayahHighlightClass = (verse) => {
  if (isBookmarkedVerse(verse)) {
    // The ring is inset (not outset) so the outline stays inside each line
    // fragment, and the padding is horizontal only — vertical padding grows the
    // fragment boxes and reintroduces overlap even at the taller line-height.
    return 'box-decoration-clone rounded-sm bg-primary/10 px-1 inset-ring inset-ring-primary/35'
  }

  return isCurrentVerse(verse) ? 'bg-secondary' : ''
}

const handleBookmark = () => {
  const ayah = activeAyah.value
  if (!ayah || !surah.value) return

  const wasBookmarked = isBookmarkedVerse(ayah)
  toggleBookmark({
    surahId: surah.value.data.number,
    surahName: surah.value.data.name,
    ayahNumber: ayah.numberInSurah,
    text: ayah.text,
  })
  toast.success(wasBookmarked ? 'تمت إزالة الإشارة المرجعية' : 'تم حفظ الإشارة المرجعية')
}

const scrollToAyah = (ayahNumber) => {
  const el = document.getElementById(`ayah-${ayahNumber}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// When arriving with ?ayah=N (e.g. from the bookmark card), bring that ayah
// into view once the surah has rendered.
watch(
  [surah, () => route.query.ayah],
  ([loadedSurah, ayahQuery]) => {
    if (!loadedSurah || !ayahQuery) return
    nextTick(() => scrollToAyah(Number(ayahQuery)))
  },
  { immediate: true },
)
</script>

<template>
  <AsyncContent :pending="isFetching" :error="error" loading-message="جاري تحميل السورة...">
    <!-- Narrower than the shared page container so the ayat column stays
         readable; both max-widths are plain utilities, hence the `!`. -->
    <Page class="flex max-w-[43.75rem]! flex-col gap-2.5" v-if="surah">
      <Heading
        :title="normalizeQuranicText(surah.data.name)"
        :subtitle="`عدد الآيات: ${toArabicNumerals(surah.data.numberOfAyahs)} آية - سورة ${revelationLabel}`"
        :share="true"
      />

      <!-- Audio Player -->
      <AudioPlayer v-if="online" ref="playerRef" />

      <div
        class="mb-4 rounded-lg border p-4 text-justify font-quran [text-align-last:center] [text-justify:inter-word]"
      >
        <span class="mb-4 block text-center text-[2rem] leading-[2.5]" v-if="surahId != 9"
          >بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span
        >

        <template v-for="(ayah, index) in ayat" :key="ayah.number">
          <!-- Kitab glyph boxes are taller than em*2, so line-height 2 lets
               multi-line inline backgrounds (bookmark/current) overlap between
               lines — 2.4 keeps them apart. -->
          <span
            :id="`ayah-${ayah.numberInSurah}`"
            class="ayah mb-3 cursor-pointer text-[1.625rem] leading-[2.4]"
            :class="ayahHighlightClass(ayah)"
            @click="activeAyah = ayah"
            :title="`خيارات الآية ${toArabicNumerals(ayah.numberInSurah)}`"
            >{{ ayah.text }}</span
          >
          <span class="ayah-number mb-3" aria-hidden="true">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
          <div
            v-if="index < ayat.length - 1 && ayah.page !== ayat[index + 1].page"
            class="page-separator my-8 flex w-full items-center"
          >
            <span class="rounded-full border px-3 py-0.5 font-sans text-sm whitespace-nowrap text-muted-foreground">{{
              toArabicNumerals(ayah.page)
            }}</span>
          </div>
        </template>
      </div>

      <div class="flex items-center justify-center gap-2">
        <Button
          :as="RouterLink"
          :to="{ name: 'quran-surah', params: { surah: surahNumber - 1 } }"
          variant="ghost"
          :class="{ 'pointer-events-none opacity-50': surahNumber === 1 }"
        >
          <IconArrowRight class="size-5" />
          <span>السابقة</span>
        </Button>

        <BackButton :to="{ name: 'quran' }" button-class="bg-primary text-primary-foreground hover:bg-primary/90" />

        <Button
          :as="RouterLink"
          :to="{ name: 'quran-surah', params: { surah: surahNumber + 1 } }"
          variant="ghost"
          :class="{ 'pointer-events-none opacity-50': surahNumber === 114 }"
        >
          <span>التالية</span>
          <IconArrowLeft class="size-5" />
        </Button>
      </div>

      <AyahActionSheet
        :ayah="activeAyah"
        :surah-name="surah.data.name"
        :online="online"
        :bookmarked="!!activeAyah && isBookmarkedVerse(activeAyah)"
        @recite="reciteAyah"
        @tafseer="tafseerAyah = activeAyah"
        @bookmark="handleBookmark"
        @close="activeAyah = null"
      />

      <TafseerSheet
        :ayah="tafseerAyah"
        :has-prev="tafseerIndex > 0"
        :has-next="tafseerIndex >= 0 && tafseerIndex < ayat.length - 1"
        @prev="stepTafseer(-1)"
        @next="stepTafseer(1)"
        @close="tafseerAyah = null"
      />
    </Page>
  </AsyncContent>
</template>

<style scoped>
@import '@/shared/styles/quran.css';

/* Rules running out from the centred page marker to both edges — pseudo
   elements, so they cannot be expressed as utilities. */
.page-separator::before,
.page-separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border);
}
</style>
