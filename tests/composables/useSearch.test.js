import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSearch } from '@/composables/useSearch'

const items = [
  { name: 'سورة الفاتحة', rewaya: 'حفص' },
  { name: 'سورة البقرة', rewaya: 'ورش' },
  { name: 'Al-Ikhlas', rewaya: 'Hafs' },
]

describe('useSearch', () => {
  it('returns all items when the query is empty', () => {
    const { filtered } = useSearch(items, ['name'])
    expect(filtered.value).toEqual(items)
  })

  it('filters by a single key', () => {
    const { search, filtered } = useSearch(items, ['name'])
    search.value = 'البقرة'
    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0].name).toBe('سورة البقرة')
  })

  it('matches across normalized Arabic variants', () => {
    const { search, filtered } = useSearch([{ name: 'مكة' }], ['name'])
    // taa marbuta normalizes to haa, alef variants unify, etc.
    search.value = 'مكه'
    expect(filtered.value).toHaveLength(1)
  })

  it('searches across multiple keys', () => {
    const { search, filtered } = useSearch(items, ['name', 'rewaya'])
    search.value = 'ورش'
    expect(filtered.value).toHaveLength(1)
    expect(filtered.value[0].rewaya).toBe('ورش')
  })

  it('is case-insensitive for Latin text', () => {
    const { search, filtered } = useSearch(items, ['name'])
    search.value = 'al-ikhlas'
    expect(filtered.value).toHaveLength(1)
  })

  it('reacts to changes in a ref-based items source', () => {
    const source = ref([{ name: 'first' }])
    const { search, filtered } = useSearch(source, ['name'])
    search.value = 'second'
    expect(filtered.value).toHaveLength(0)
    source.value = [{ name: 'second' }]
    expect(filtered.value).toHaveLength(1)
  })

  it('returns no results when nothing matches', () => {
    const { search, filtered } = useSearch(items, ['name'])
    search.value = 'zzzzz'
    expect(filtered.value).toEqual([])
  })
})
