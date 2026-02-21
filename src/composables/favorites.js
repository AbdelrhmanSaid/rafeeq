import { useLocalStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'

export const useFavorites = (storageKey) => {
  const keys = useLocalStorage(storageKey, [])

  const isFavorite = (key) => keys.value.includes(key)

  const toggleFavorite = (key) => {
    if (isFavorite(key)) {
      keys.value = keys.value.filter((k) => k !== key)
    } else {
      keys.value.push(key)
    }
  }

  const filterFavorites = (items, keyFn) =>
    computed(() => toValue(items).filter((item) => isFavorite(keyFn(item))))

  return {
    keys,
    isFavorite,
    toggleFavorite,
    filterFavorites,
  }
}
