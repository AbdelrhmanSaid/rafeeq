import { describe, it, expect } from 'vitest'
import { useSearch } from './useSearch'

const items = [
  { name: 'عبدالباسط عبدالصمد', description: 'مجود' },
  { name: 'محمد صديق المنشاوي', description: 'مرتل' },
  { name: 'أذكار الصباح' },
]

const run = (query, keys = ['name', 'description']) => {
  const { search, filtered } = useSearch(items, keys)
  search.value = query
  return filtered.value.map((item) => item.name)
}

describe('useSearch', () => {
  it('returns every item for an empty or blank query', () => {
    expect(run('')).toHaveLength(3)
    expect(run('   ')).toHaveLength(3)
  })

  it('ignores leading, trailing and doubled spaces', () => {
    expect(run(' الصباح ')).toEqual(['أذكار الصباح'])
    expect(run('اذكار  الصباح')).toEqual(['أذكار الصباح'])
  })

  it('matches names whether or not they are written with a space', () => {
    expect(run('عبد الباسط')).toEqual(['عبدالباسط عبدالصمد'])
    expect(run('عبدالباسط')).toEqual(['عبدالباسط عبدالصمد'])
    expect(run('محمدصديق')).toEqual(['محمد صديق المنشاوي'])
  })

  it('searches every given key and folds letter variants', () => {
    expect(run('مرتل')).toEqual(['محمد صديق المنشاوي'])
    expect(run('اذكار')).toEqual(['أذكار الصباح'])
  })
})
