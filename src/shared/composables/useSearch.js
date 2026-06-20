import { computed, ref, toValue } from 'vue'
import { normalize } from '@/shared/utils/arabic'

export const useSearch = (items, keys = []) => {
  const search = ref('')

  const filtered = computed(() => {
    const itemsValue = toValue(items)

    if (!search.value) return itemsValue

    // Normalize the search value
    const normalizedSearch = normalize(search.value)

    return itemsValue.filter((item) => {
      return keys.some((key) => {
        const value = normalize(item[key])

        return value.includes(normalizedSearch)
      })
    })
  })

  return {
    search,
    filtered,
  }
}
