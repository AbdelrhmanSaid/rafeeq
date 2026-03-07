<script setup>
import { computed, ref, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import BackButton from '@/components/BackButton.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import AudioPlayer from '@/components/QuranPlayer.vue'
import { useQuranStore } from '@/stores/quran'
import { useMeta } from '@/utilities/head'
import { toArabicNumerals } from '@/utilities/arabic'
import { useQuranService } from '@/services/quranService'

const online = useOnline()
const surahId = useRouteParams('surah')
const quranStore = useQuranStore()
const { fetchSurah } = useQuranService()

const surah = ref(null)
const isFetching = ref(true)
const error = ref(null)

const quranSurah = ref(null)
const quranLoading = ref(false)
const quranLoadingError = ref(null)

async function loadSurah() {
  isFetching.value = true
  error.value = null

  try {
    surah.value = await fetchSurah(surahId.value)
    loadAudio()
  } catch (e) {
    error.value = e
  } finally {
    isFetching.value = false
  }
}

async function loadAudio() {
  if (!online.value || !surah.value) return

  try {
    quranLoading.value = true
    quranLoadingError.value = null

    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surah.value.data.number}/${quranStore.currentReciter}`,
    )
    if (!response.ok) throw new Error('Failed to fetch audio')
    const data = await response.json()

    quranSurah.value = data.data
    quranStore.playSurah(data.data)
    quranStore.currentAudio = null
  } catch (err) {
    quranLoadingError.value = err.message
  } finally {
    quranLoading.value = false
  }
}

loadSurah()

watch(surah, (val) => {
  if (val) {
    useMeta({
      title: val.data.name,
      description: `قراءة وتلاوة سورة ${val.data.name} - ${toArabicNumerals(val.data.numberOfAyahs)} آية - سورة ${val.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`,
      keywords: ['قرآن', 'سورة', val.data.name, 'تلاوة', 'قراءة', 'رفيق'],
    })
  }
})

const ayat = computed(() => {
  if (surah.value) {
    let ayat = surah.value.data.ayahs

    if (surah.value.data.number === 1) {
      ayat = ayat.slice(1)
    }

    return ayat.map((ayah) => {
      const text = (ayah.numberInSurah === 1
        ? ayah.text.replace('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ', '')
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
      <span class="basmallah" v-if="surahId != 9">بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>

      <template v-for="(ayah, index) in ayat" :key="ayah.number">
        <span
          class="ayah clickable-ayah"
          :class="{ 'current-ayah': isCurrentVerse(ayah) }"
          @click="playVerse(ayah)"
          :title='`تشغيل الآية ${toArabicNumerals(ayah.numberInSurah)}`'
          >{{ ayah.text }}</span
        >
        <span class="ayah-number" aria-hidden="true">{{ toArabicNumerals(ayah.numberInSurah) }}</span>
        <div
          v-if="index < ayat.length - 1 && ayah.page !== ayat[index + 1].page"
          class="page-separator"
        >
          <span class="page-number">{{ toArabicNumerals(ayah.page) }}</span>
        </div>
      </template>
    </div>

    <div class="d-flex justify-content-center">
      <BackButton :to="{ name: 'quran' }" button-class="btn-primary" />
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
      background-color: var(--bs-primary-bg-subtle);
    }
  }
}
</style>
