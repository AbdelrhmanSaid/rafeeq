<script setup>
import { computed, ref } from 'vue'
import { useOnline } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import AsyncContent from '@/shared/ui/AsyncContent.vue'
import AudioPlayer from '@/features/quran/components/QuranPlayer.vue'
import { useQuranStore } from '@/features/quran/store'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { toArabicNumerals, removeBismillah } from '@/shared/utils/arabic'
import { fetchSurah } from '@/features/quran/api'

const online = useOnline()
const surahId = useRouteParams('surah')
const quranStore = useQuranStore()
const playerRef = ref(null)

const {
  data: surah,
  error,
  pending: isFetching,
} = useAsyncData(async () => {
  const result = await fetchSurah(surahId.value)
  if (online.value && result) {
    await quranStore.loadSurahAudio(result.data.number, result.data.name)
  }
  return result
})

const revelationLabel = computed(() => (surah.value?.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'))

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

const playVerse = (verse) => {
  if (!playerRef.value) return
  playerRef.value.seekToAyah(verse.numberInSurah)
}

const isCurrentVerse = (verse) => {
  const currentAyah = quranStore.currentAyah
  if (!currentAyah || !surah.value) return false
  return currentAyah.ayah === verse.numberInSurah
}
</script>

<template>
  <AsyncContent :pending="isFetching" :error="error" loading-message="جاري تحميل السورة...">
    <Page class="quran-page" v-if="surah">
      <Heading
        :title="surah.data.name"
        :subtitle="`عدد الآيات: ${toArabicNumerals(surah.data.numberOfAyahs)} آية - سورة ${revelationLabel}`"
        :share="true"
      />

      <!-- Audio Player -->
      <AudioPlayer v-if="online" ref="playerRef" />

      <div class="ayat font-quran mb-4">
        <span class="basmallah" v-if="surahId != 9">بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>

        <template v-for="(ayah, index) in ayat" :key="ayah.number">
          <span
            class="ayah clickable-ayah"
            :class="{ 'current-ayah': isCurrentVerse(ayah) }"
            @click="playVerse(ayah)"
            :title="`تشغيل الآية ${toArabicNumerals(ayah.numberInSurah)}`"
            >{{ ayah.text }}</span
          >
          <span class="ayah-number" aria-hidden="true">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
          <div v-if="index < ayat.length - 1 && ayah.page !== ayat[index + 1].page" class="page-separator">
            <span class="page-number">{{ toArabicNumerals(ayah.page) }}</span>
          </div>
        </template>
      </div>

      <div class="d-flex justify-content-center">
        <BackButton :to="{ name: 'quran' }" button-class="btn-primary" />
      </div>
    </Page>
  </AsyncContent>
</template>

<style lang="scss" scoped>
@import '@/shared/styles/quran.css';

.quran-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 700px;

  .ayat {
    padding: 1rem;
    border-radius: 5px;
    border: 1px solid var(--bs-border-color);
    text-align: justify;
    text-align-last: center;
    text-justify: inter-word;

    .basmallah {
      display: block;
      font-size: 2rem;
      line-height: 2.5;
      text-align: center;
      margin-bottom: 1rem;
    }

    .ayah {
      line-height: 2;
      font-size: 1.625rem;
    }

    .ayah,
    .ayah-number {
      margin-bottom: 0.75rem;
    }

    .page-separator {
      display: flex;
      align-items: center;
      width: 100%;
      margin: 2rem 0;

      &::before,
      &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--bs-border-color);
      }

      .page-number {
        padding: 0.15rem 0.75rem;
        font-size: 0.875rem;
        color: var(--bs-gray-600);
        font-family: 'IBM Plex Sans Arabic', sans-serif;
        white-space: nowrap;
        border: 1px solid var(--bs-border-color);
        border-radius: 999px;
      }
    }

    .clickable-ayah {
      cursor: pointer;
    }

    .current-ayah {
      background-color: var(--bs-secondary-bg);
    }
  }
}
</style>
