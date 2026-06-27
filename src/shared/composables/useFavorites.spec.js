import { beforeEach, describe, it, expect } from 'vitest'
import { nextTick, ref } from 'vue'
import { useFavorites } from './useFavorites'

const KEY = 'testFavorites'

beforeEach(() => {
  localStorage.clear()
})

describe('useFavorites', () => {
  it('starts empty', () => {
    const { keys, isFavorite } = useFavorites(KEY)
    expect(keys.value).toEqual([])
    expect(isFavorite('a')).toBe(false)
  })

  it('toggles a key on and off', () => {
    const { isFavorite, toggleFavorite } = useFavorites(KEY)

    toggleFavorite('a')
    expect(isFavorite('a')).toBe(true)

    toggleFavorite('a')
    expect(isFavorite('a')).toBe(false)
  })

  it('persists favorites to localStorage', async () => {
    useFavorites(KEY).toggleFavorite('a')
    await nextTick()
    expect(JSON.parse(localStorage.getItem(KEY))).toEqual(['a'])
  })

  it('filters a collection down to the favorites', () => {
    const { toggleFavorite, filterFavorites } = useFavorites(KEY)
    toggleFavorite(2)

    const items = ref([{ id: 1 }, { id: 2 }, { id: 3 }])
    const favorites = filterFavorites(items, (item) => item.id)

    expect(favorites.value).toEqual([{ id: 2 }])

    toggleFavorite(3)
    expect(favorites.value).toEqual([{ id: 2 }, { id: 3 }])
  })
})
