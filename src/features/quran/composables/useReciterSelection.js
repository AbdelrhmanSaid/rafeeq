import { computed } from 'vue'
import reciters from '@/features/quran/data/reciters.js'
import { useQuranStore } from '@/features/quran/store.js'

const normalize = (s) => s.replace(/\s+/g, ' ')

// Reciters with a complete mushaf (all 114 surahs), with their rewaya normalized.
const fullReciters = reciters.filter((r) => r.soar_count >= 114).map((r) => ({ ...r, rewaya: normalize(r.rewaya) }))

/**
 * Shared rewaya/reciter selection state, used by both the settings screen and
 * the in-surah reciter sheet.
 */
export function useReciterSelection() {
  const quranStore = useQuranStore()

  const rewayat = computed(() => [...new Set(fullReciters.map((r) => r.rewaya))])
  const currentRewaya = computed(() => normalize(quranStore.reciter?.rewaya ?? '') || rewayat.value[0])
  const filteredReciters = computed(() => fullReciters.filter((r) => r.rewaya === currentRewaya.value))
  const currentReciterId = computed(() => Number(quranStore.currentReciter))

  function selectRewaya(rewaya) {
    const first = fullReciters.find((r) => r.rewaya === rewaya)
    if (first) quranStore.changeReciter(first.id)
  }

  function selectReciter(reciterId) {
    quranStore.changeReciter(Number(reciterId))
  }

  return {
    rewayat,
    currentRewaya,
    filteredReciters,
    currentReciterId,
    selectRewaya,
    selectReciter,
  }
}
