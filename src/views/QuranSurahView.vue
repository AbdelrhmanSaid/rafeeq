<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'
import { useFetch, useOnline } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import AudioPlayer from '@/components/QuranPlayer.vue'
import { useQuranStore } from '@/stores/quran'
import { useMeta } from '@/utilities/head'
import { toArabicNumerals } from '@/utilities/arabic'

const online = useOnline()

const surahId = useRouteParams('surah')
const endpoint = `https://api.alquran.cloud/v1/surah/${surahId.value}`
const { isFetching, data: surah, error, onFetchResponse } = useFetch(endpoint).json().get()

const quranStore = useQuranStore()
const quranSurah = ref(null)
const quranLoading = ref(false)
const quranLoadingError = ref(null)

onFetchResponse(async () => {
  useMeta({
    title: surah.value.data.name,
    description: `قراءة وتلاوة سورة ${surah.value.data.name} - ${toArabicNumerals(surah.value.data.numberOfAyahs)} آية - سورة ${surah.value.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`,
    keywords: ['قرآن', 'سورة', surah.value.data.name, 'تلاوة', 'قراءة', 'رفيق'],
  })

  try {
    quranLoading.value = true
    quranLoadingError.value = null

    const endpoint = `https://api.alquran.cloud/v1/surah/${surah.value.data.number}/${quranStore.currentReciter}`
    const { data } = await useFetch(endpoint).json().get()
    const audioData = data.value.data

    quranSurah.value = audioData
    quranStore.playSurah(audioData)
    quranStore.currentAudio = null
  } catch (err) {
    quranLoadingError.value = err.message
  } finally {
    quranLoading.value = false
  }
})

// Prepare the ayat data
const ayat = computed(() => {
  if (surah.value) {
    let ayat = surah.value.data.ayahs

    // Remove the Basmala from the Al-Fatiha
    if (surah.value.data.number === 1) {
      ayat = ayat.slice(1)
    }

    return ayat.map((ayah) => {
      // Remove the Basmala from the first Ayah of other Surahs
      const text = (ayah.numberInSurah === 1
        ? ayah.text.replace('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ', '')
        : ayah.text
      ).trim()

      return {
        ...ayah,
        text,
      }
    })
  }

  return []
})

const playVerse = (verse) => {
  if (!quranSurah.value) return

  const verseIndex = quranSurah.value.ayahs.findIndex((ayah) => ayah.numberInSurah === verse.numberInSurah)

  if (verseIndex === -1) return
  if (quranStore.currentPlaylist.length === 0) quranStore.playSurah(quranSurah.value)

  quranStore.jumpToVerse(verseIndex)
  quranStore.shouldAutoPlay = true
}

const isCurrentVerse = (verse) => {
  const currentAudio = quranStore.currentAudio
  if (!currentAudio || !surah.value) return false

  return currentAudio.verseNumber === verse.numberInSurah && currentAudio.surahName === surah.value.data.name
}
</script>

<template>
  <Page v-if="isFetching">
    <LoadingState />
  </Page>

  <Page v-else-if="error">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
  </Page>

  <Page class="quran-page" v-else-if="surah">
    <Heading
      :title="surah.data.name"
      :subtitle="`عدد الآيات: ${toArabicNumerals(surah.data.numberOfAyahs)} آية - سورة ${surah.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`"
      :share="true"
    />

    <!-- Audio Player -->
    <AudioPlayer v-if="online" />

    <div class="ayat font-quran mb-4">
      <span class="basmallah">بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>

      <template v-for="ayah in ayat" :key="ayah.number">
        <span
          class="ayah clickable-ayah"
          :class="{ 'current-ayah': isCurrentVerse(ayah) }"
          @click="playVerse(ayah)"
          :title='`تشغيل الآية ${toArabicNumerals(ayah.numberInSurah)}`'
          >{{ ayah.text }}</span
        >
        <span class="ayah-number" aria-hidden="true">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
      </template>
    </div>

    <div class="d-flex justify-content-center">
      <RouterLink :to="{ name: 'quran' }" class="btn btn-primary">
        <IconChevronLeft size="1.25rem" />
      </RouterLink>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
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

    .ayah,
    .ayah-number {
      line-height: 2;
      font-size: 1.625rem;
      margin-bottom: 0.75rem;
    }

    .ayah {
      display: inline;
      text-wrap: pretty;
      margin-inline: 0 0.2rem;
    }

    .ayah-number {
      width: 2.2rem;
      height: 2.2rem;
      margin-inline: 0.35rem 0.6rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--bs-border-color);
      border-radius: 999px;
      background-color: var(--bs-secondary-bg);
      color: var(--bs-gray-600);
      vertical-align: middle;
      font-size: 1rem;
      line-height: 1;
      font-family: 'IBM Plex Sans Arabic', sans-serif;
    }

    .clickable-ayah {
      cursor: pointer;
    }

    .current-ayah {
      background-color: var(--bs-primary-bg-subtle);
    }
  }
}
</style>
