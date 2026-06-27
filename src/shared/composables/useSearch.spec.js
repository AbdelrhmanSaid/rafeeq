import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSearch } from './useSearch'

const ITEMS = [
  { name: 'البقرة', en: 'Al-Baqarah' },
  { name: 'الكهف', en: 'Al-Kahf' },
  { name: 'الإخلاص', en: 'Al-Ikhlas' },
]

describe('useSearch', () => {
  it('returns every item when the query is empty', () => {
    const { filtered } = useSearch(ITEMS, ['name'])
    expect(filtered.value).toEqual(ITEMS)
  })

  it('filters by a normalised Arabic substring', () => {
    const { search, filtered } = useSearch(ITEMS, ['name'])
    search.value = 'كهف'
    expect(filtered.value).toEqual([ITEMS[1]])
  })

  it('ignores hamza and alef variants via normalisation', () => {
    const { search, filtered } = useSearch(ITEMS, ['name'])
    // Search "الاخلاص" (plain alef) should still match "الإخلاص" (hamza alef).
    search.value = 'الاخلاص'
    expect(filtered.value).toEqual([ITEMS[2]])
  })

  it('searches across multiple keys', () => {
    const { search, filtered } = useSearch(ITEMS, ['name', 'en'])
    search.value = 'kahf'
    expect(filtered.value).toEqual([ITEMS[1]])
  })

  it('accepts a reactive items source', () => {
    const items = ref([ITEMS[0]])
    const { filtered } = useSearch(items, ['name'])

    expect(filtered.value).toEqual([ITEMS[0]])
    items.value = ITEMS
    expect(filtered.value).toEqual(ITEMS)
  })
})
