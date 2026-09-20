import { computed, ref, toValue } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const today = () => new Date().toLocaleDateString('en-CA')

// Persisted counts expire at the local day boundary.
export const useAzkarProgress = (slug, persist = true) => {
  const state = persist
    ? useLocalStorage(() => `${STORAGE_KEYS.azkarProgress}:${toValue(slug)}`, { date: today(), counts: {} })
    : ref({ date: today(), counts: {} })

  if (state.value.date !== today()) state.value = { date: today(), counts: {} }

  const counts = computed(() => state.value.counts)

  const reset = () => {
    state.value = { date: today(), counts: {} }
  }

  return { counts, reset }
}
