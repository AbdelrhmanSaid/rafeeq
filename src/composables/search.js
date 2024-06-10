import { computed, ref } from 'vue'
import { normalize } from '@/utilities/arabic'

export const useSearch = (items, keys = []) => {
  const search = ref('')

  const filtered = computed(() => {
    if (!search.value) return items

    return items.filter((item) => {
      return keys.some((key) => {
        const value = normalize(item[key])

        return value.includes(normalize(search.value))
      })
    })
  })

  return {
    search,
    keys,
    filtered,
  }
}
