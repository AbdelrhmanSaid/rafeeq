import { computed, ref } from 'vue'
import ar from '@/utilities/arabic'

export const useSearch = (items, keys = []) => {
  const search = ref('')

  const filtered = computed(() => {
    if (!search.value) return items

    // Normalize the search value
    const normalizedSearch = ar.normalize(search.value)

    return items.filter((item) => {
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
