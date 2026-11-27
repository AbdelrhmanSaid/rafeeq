import { computed, ref, toValue } from 'vue'
import { normalize } from '@/shared/utils/arabic'

// Names are spelled both ways, "عبد الباسط" and "عبدالباسط", so matching ignores spaces altogether.
const compact = (text) => normalize(text).replaceAll(' ', '')

export const useSearch = (items, keys = []) => {
  const search = ref('')

  const filtered = computed(() => {
    const itemsValue = toValue(items)
    const query = compact(search.value)

    if (!query) return itemsValue

    return itemsValue.filter((item) => keys.some((key) => compact(item[key] ?? '').includes(query)))
  })

  return {
    search,
    filtered,
  }
}
