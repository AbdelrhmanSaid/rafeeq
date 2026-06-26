import { computed, ref, toValue } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

// Local date as YYYY-MM-DD, used to expire progress at the day boundary.
const today = () => new Date().toLocaleDateString('en-CA')

// Per-category zekr counts that survive reloads but reset each day. `counts` is
// an object keyed by the zekr's index within the category. When `persist` is
// false the counts live only in memory, so progress resets on reload.
export const useAzkarProgress = (slug, persist = true) => {
  const state = persist
    ? useLocalStorage(() => `${STORAGE_KEYS.azkarProgress}:${toValue(slug)}`, { date: today(), counts: {} })
    : ref({ date: today(), counts: {} })

  // Drop yesterday's counts when the category is opened on a new day.
  if (state.value.date !== today()) state.value = { date: today(), counts: {} }

  const counts = computed(() => state.value.counts)

  const reset = () => {
    state.value = { date: today(), counts: {} }
  }

  return { counts, reset }
}
