<script setup>
import { IconChevronLeft } from '@tabler/icons-vue'

const route = useRoute()
const online = useOnline()
const quranStore = useQuranStore()

const surahId = computed(() => route.params.surah)

// Fetch surah data
const { data: surahResponse, status, error } = await useFetch(`https://api.alquran.cloud/v1/surah/${surahId.value}`)

const surah = computed(() => surahResponse.value?.data)

// Audio data
const quranSurah = ref(null)
const quranLoading = ref(false)
const quranLoadingError = ref(null)

// Set SEO meta when surah is loaded
watch(surah, (data) => {
  if (data) {
    useSeoMeta({
      title: `${data.name} - رفيق`,
      ogTitle: `${data.name} - رفيق`,
      description: `قراءة وتلاوة سورة ${data.name} - ${data.numberOfAyahs} آية - سورة ${data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`,
      ogDescription: `قراءة وتلاوة سورة ${data.name} - ${data.numberOfAyahs} آية`,
      keywords: `قرآن, سورة, ${data.name}, تلاوة, قراءة, رفيق`,
    })
  }
}, { immediate: true })

// Load audio data when surah is fetched
watch(surah, async (data) => {
  if (!data || !import.meta.client) return

  try {
    quranLoading.value = true
    quranLoadingError.value = null

    const response = await $fetch(`https://api.alquran.cloud/v1/surah/${data.number}/${quranStore.currentReciter}`)
    const audioData = response.data

    quranSurah.value = audioData
    quranStore.playSurah(audioData)
    quranStore.currentAudio = null
  } catch (err) {
    quranLoadingError.value = err.message
  } finally {
    quranLoading.value = false
  }
}, { immediate: true })

// Prepare the ayat data
const ayat = computed(() => {
  if (surah.value) {
    let ayatList = surah.value.ayahs

    // Remove the Basmala from the Al-Fatiha
    if (surah.value.number === 1) {
      ayatList = ayatList.slice(1)
    }

    return ayatList.map((ayah) => ({
      ...ayah,
      // Remove the Basmala from the first Ayah of other Surahs
      text: (ayah.numberInSurah === 1
        ? ayah.text.replace('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ', '')
        : ayah.text
      ).trim(),
    }))
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

  return currentAudio.verseNumber === verse.numberInSurah && currentAudio.surahName === surah.value.name
}
</script>

<template>
  <Page v-if="status === 'pending'">
    <LoadingState />
  </Page>

  <Page v-else-if="error">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
  </Page>

  <Page class="quran-page" v-else-if="surah">
    <Heading
      :title="surah.name"
      :subtitle="`عدد الآيات: ${surah.numberOfAyahs} آية - سورة ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`"
    />

    <!-- Audio Player -->
    <QuranPlayer v-if="online" />

    <div class="ayat font-quran mb-4">
      <span class="basmallah">بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>

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
      <NuxtLink to="/quran" class="btn btn-primary">
        <IconChevronLeft size="1.25rem" />
      </NuxtLink>
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
      line-height: 2;
      font-size: 1.625rem;
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

