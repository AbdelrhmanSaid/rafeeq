<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'
import { useFetch } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import AudioPlayer from '@/components/QuranPlayer.vue'
import { useQuranStore } from '@/stores/quran'

const surahId = useRouteParams('surah')
const { isFetching, data: surah, error } = useFetch(`https://api.alquran.cloud/v1/surah/${surahId.value}`).json().get()
const audioStore = useQuranStore()

const audioSurah = ref(null)
const audioLoading = ref(false)
const audioError = ref(null)

// Prepare the ayat data
const ayat = computed(() => {
  if (surah.value) {
    let ayat = surah.value.data.ayahs

    // Remove the Basmala from the Al-Fatiha
    if (surah.value.data.number === 1) {
      ayat = ayat.slice(1)
    }

    return ayat.map((ayah) => ({
      ...ayah,

      // Remove the Basmala from the first Ayah of other Surahs
      text: (ayah.numberInSurah === 1
        ? ayah.text.replace('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ', '')
        : ayah.text
      ).trim(),
    }))
  }

  return []
})

const loadSurahAudio = async () => {
  if (!surah.value || audioLoading.value) return

  try {
    audioLoading.value = true
    audioError.value = null

    const endpoint = `http://api.alquran.cloud/v1/surah/${surah.value.data.number}/${audioStore.selectedReciter}`
    const response = await fetch(endpoint)
    const data = await response.json()
    const audioData = data.data

    audioSurah.value = audioData
    audioStore.playSurah(audioData)
    audioStore.currentAudio = null
  } catch (err) {
    console.error('Error loading surah audio:', err)
    audioError.value = err.message
  } finally {
    audioLoading.value = false
  }
}

const playVerse = (verse) => {
  if (!audioSurah.value) return
  const verseIndex = audioSurah.value.ayahs.findIndex((ayah) => ayah.numberInSurah === verse.numberInSurah)
  if (verseIndex === -1) return
  if (audioStore.currentPlaylist.length === 0) {
    audioStore.playSurah(audioSurah.value)
  }
  audioStore.jumpToVerse(verseIndex)
  audioStore.shouldAutoPlay = true
}

const isCurrentVerse = (verse) => {
  const currentAudio = audioStore.currentAudio
  if (!currentAudio || !surah.value) return false

  return currentAudio.verseNumber === verse.numberInSurah && currentAudio.surahName === surah.value.data.name
}

onMounted(() => {
  audioStore.initializeStore()
})

watch(
  surah,
  (newSurah) => {
    if (newSurah) {
      loadSurahAudio()
    }
  },
  { immediate: true },
)
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
      :subtitle="`عدد الآيات: ${surah.data.numberOfAyahs} آية - سورة ${surah.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`"
    />

    <!-- Audio Player -->
    <AudioPlayer />

    <div class="ayat font-quran mb-4">
      <span class="basmallah">بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>

      <template v-for="ayah in ayat" :key="ayah.number">
        <span
          class="ayah clickable-ayah rounded px-1"
          :class="{ 'current-ayah': isCurrentVerse(ayah) }"
          @click="playVerse(ayah)"
          :title="'تشغيل الآية ' + ayah.numberInSurah"
          >{{ ayah.text }}</span
        >
        <span class="ayah-number">﴿{{ ayah.numberInSurah }}﴾</span>
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
    text-align: justify;
    border: 1px solid var(--bs-border-color);

    .basmallah {
      display: block;
      font-size: 2rem;
      line-height: 2.5;
      text-align: center;
      margin-bottom: 1rem;
    }

    .ayah,
    .ayah-number {
      line-height: 2.125;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .ayah-number {
      padding: 0.25rem 0.5rem;
      color: var(--bs-gray-600);
      vertical-align: middle;
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
