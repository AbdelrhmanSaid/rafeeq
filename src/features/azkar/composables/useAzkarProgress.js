import { useLocalStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

// Persisted map of category slug -> array of per-zekr counts, so a user can
// leave a category (or reload the page) and resume their azkar where they
// stopped. Defined at module scope so every caller shares one reactive source.
const store = useLocalStorage(STORAGE_KEYS.azkarProgress, {})

export const useAzkarProgress = (slug) => {
  const counts = computed(() => store.value[toValue(slug)] ?? [])

  const getCount = (index) => counts.value[index] ?? 0

  const setCount = (index, value) => {
    const next = [...counts.value]
    next[index] = value
    store.value = { ...store.value, [toValue(slug)]: next }
  }

  const clear = () => {
    const next = { ...store.value }
    delete next[toValue(slug)]
    store.value = next
  }

  return { counts, getCount, setCount, clear }
}
