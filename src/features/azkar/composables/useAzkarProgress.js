import { useLocalStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

// Persisted daily azkar progress: a date stamp plus a map of category slug ->
// array of per-zekr counts. Azkar are read fresh every day, so the whole
// store resets automatically once the local date rolls over. Defined at module
// scope so every caller shares one reactive source.
const store = useLocalStorage(STORAGE_KEYS.azkarProgress, { date: '', categories: {} })

// Local calendar day as YYYY-MM-DD (en-CA yields that ISO-like format).
const today = () => new Date().toLocaleDateString('en-CA')

export const useAzkarProgress = (slug) => {
  // Drop yesterday's progress as soon as a new day starts.
  const sync = () => {
    if (store.value.date !== today()) {
      store.value = { date: today(), categories: {} }
    }
  }

  sync()

  const counts = computed(() => (store.value.date === today() ? (store.value.categories[toValue(slug)] ?? []) : []))

  const getCount = (index) => counts.value[index] ?? 0

  const setCount = (index, value) => {
    sync()
    const next = [...counts.value]
    next[index] = value
    store.value = { date: today(), categories: { ...store.value.categories, [toValue(slug)]: next } }
  }

  const clear = () => {
    const categories = { ...store.value.categories }
    delete categories[toValue(slug)]
    store.value = { ...store.value, categories }
  }

  return { counts, getCount, setCount, clear }
}
