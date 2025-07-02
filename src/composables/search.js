import { computed, ref, toValue } from 'vue'
import ar from '@/utilities/arabic'

export const useSearch = (items, keys = []) => {
  const search = ref('')

  const filtered = computed(() => {
    const itemsValue = toValue(items)

    if (!search.value) return itemsValue

    // Normalize the search value
    const normalizedSearch = ar.normalize(search.value)

    return itemsValue.filter((item) => {
      return keys.some((key) => {
        const value = ar.normalize(item[key])

        return value.includes(normalizedSearch)
      })
    })
  })

  return {
    search,
    keys,
    filtered,
  }
}
