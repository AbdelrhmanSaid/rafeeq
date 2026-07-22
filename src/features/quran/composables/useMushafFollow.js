import { ref, computed, watch, toValue } from 'vue'
import { useQuranStore } from '@/features/quran/store'

// Keeps the mushaf on the reciter's page during playback. Manual browsing
// away from the reciting page suspends following until the user returns or
// taps the resume affordance.
export function useMushafFollow({ surahNumber, visiblePage, isAutoNavigating, goToPage, pageOfAyah }) {
  const quranStore = useQuranStore()
  const suspended = ref(false)

  const currentAyahNumber = computed(() => {
    if (quranStore.currentSurahNumber !== toValue(surahNumber)) return null
    return quranStore.currentAyah?.ayah ?? null
  })

  const currentAyahPage = computed(() => {
    const ayah = currentAyahNumber.value
    return ayah == null ? null : pageOfAyah(ayah)
  })

  watch(currentAyahNumber, (ayah) => {
    if (ayah == null) {
      suspended.value = false
      return
    }
    if (suspended.value) return
    const page = currentAyahPage.value
    if (page != null && page !== visiblePage.value) {
      goToPage(page, { behavior: 'smooth', ayah })
    }
  })

  watch(visiblePage, (page) => {
    if (isAutoNavigating.value || currentAyahPage.value == null) return
    suspended.value = page !== currentAyahPage.value
  })

  function resume() {
    suspended.value = false
    const ayah = currentAyahNumber.value
    if (ayah != null) goToPage(currentAyahPage.value, { behavior: 'smooth', ayah })
  }

  return { suspended, resume, currentAyahNumber, currentAyahPage }
}
