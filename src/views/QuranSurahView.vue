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
import AudioPlayer from '@/components/AudioPlayer.vue'
import ReciterSelector from '@/components/ReciterSelector.vue'
import { useAudioStore } from '@/stores/audio'
import AudioService from '@/services/audioService'

const surahId = useRouteParams('surah')
const { isFetching, data: surah, error } = useFetch(`https://api.alquran.cloud/v1/surah/${surahId.value}`).json().get()
const audioStore = useAudioStore()

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
    
    const audioData = await AudioService.getAudioForSurah(
      surah.value.data.number,
      audioStore.selectedReciter
    )
    
    audioSurah.value = audioData
  } catch (err) {
    console.error('Error loading surah audio:', err)
    audioError.value = err.message
  } finally {
    audioLoading.value = false
  }
}

const playVerse = (verse) => {
  if (audioSurah.value) {
    const audioVerse = audioSurah.value.ayahs.find(
      ayah => ayah.numberInSurah === verse.numberInSurah
    )
    if (audioVerse) {
      audioStore.playVerse(audioVerse, audioSurah.value)
    }
  }
}

const playSurah = () => {
  if (audioSurah.value) {
    audioStore.playSurah(audioSurah.value)
  }
}

onMounted(() => {
  audioStore.initializeStore()
})

watch(surah, (newSurah) => {
  if (newSurah) {
    loadSurahAudio()
  }
}, { immediate: true })

watch(() => audioStore.selectedReciter, () => {
  loadSurahAudio()
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

    <!-- Audio Controls -->
    <div class="audio-controls-section mb-3">
      <div class="d-flex gap-2 align-items-center justify-content-center flex-wrap">
        <button 
          @click="playSurah" 
          class="btn btn-success"
          :disabled="audioLoading || !audioSurah"
        >
          <IconPlayerPlay size="1.25rem" />
          تشغيل السورة
        </button>
        
        <ReciterSelector />
        
        <div v-if="audioLoading" class="text-muted">
          <small>جاري تحميل الصوت...</small>
        </div>
        
        <div v-if="audioError" class="text-danger">
          <small>خطأ في تحميل الصوت</small>
        </div>
      </div>
    </div>

    <!-- Audio Player -->
    <AudioPlayer />

    <div class="ayat font-quran mb-4">
      <span class="basmallah">بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>

      <template v-for="ayah in ayat" :key="ayah.number">
        <span 
          class="ayah clickable-ayah" 
          @click="playVerse(ayah)"
          :title="'تشغيل الآية ' + ayah.numberInSurah"
        >{{ ayah.text }}</span>
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
      
      &:hover {
        background-color: var(--bs-primary-bg-subtle);
        border-radius: 4px;
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
