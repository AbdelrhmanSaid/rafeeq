<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { IconChevronLeft, IconPlayerPlay } from '@tabler/icons-vue'
import { useFetch } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import AudioPlayer from '@/components/QuranPlayer.vue'
import { useQuranStore } from '@/stores/quran'
import QuranService from '@/services/quran'

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

    const audioData = await QuranService.getAudioForSurah(surah.value.data.number, audioStore.selectedReciter)

    audioSurah.value = audioData
  } catch (err) {
    console.error('Error loading surah audio:', err)
    audioError.value = err.message
  } finally {
    audioLoading.value = false
  }
}

const playVerse = (verse) => {
  console.log('playVerse called with:', verse.numberInSurah)
  if (audioSurah.value) {
    // Find the index of this verse in the playlist
    const verseIndex = audioSurah.value.ayahs.findIndex((ayah) => ayah.numberInSurah === verse.numberInSurah)

    console.log('Found verse index:', verseIndex)
    console.log('Current playlist length:', audioStore.currentPlaylist.length)

    if (verseIndex !== -1) {
      // If playlist doesn't exist, create it first
      if (audioStore.currentPlaylist.length === 0) {
        console.log('Creating playlist...')
        audioStore.playSurah(audioSurah.value)
      }

      // Jump to the selected verse and mark for auto-play
      console.log('Jumping to verse and setting autoplay...')
      audioStore.jumpToVerse(verseIndex)
      audioStore.shouldAutoPlay = true
    }
  }
}

const playSurah = () => {
  if (audioSurah.value) {
    audioStore.playSurah(audioSurah.value)
  }
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

watch(audioSurah, (newAudioSurah) => {
  if (newAudioSurah && newAudioSurah.ayahs && newAudioSurah.ayahs.length > 0) {
    // Prepare the playlist but don't auto-play
    audioStore.playSurah(newAudioSurah)
    // Just clear the current audio but keep the playlist
    audioStore.currentAudio = null
  }
})
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
          class="ayah clickable-ayah"
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
      transition: background-color 0.2s ease;
      padding: 2px 4px;
      border-radius: 4px;

      &:hover {
        background-color: var(--bs-primary-bg-subtle);
      }

      &.current-ayah {
        background-color: var(--bs-primary-bg-subtle);
      }
    }
  }

  .audio-controls-section {
    .btn {
      gap: 0.5rem;
    }
  }
}
</style>
