import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useFavorites } from '@/composables/useFavorites'

describe('useFavorites', () => {
  it('starts with an empty favorites list', () => {
    const { keys } = useFavorites('fav-empty')
    expect(keys.value).toEqual([])
  })

  it('toggles a key on and off', () => {
    const { isFavorite, toggleFavorite } = useFavorites('fav-toggle')

    expect(isFavorite('a')).toBe(false)
    toggleFavorite('a')
    expect(isFavorite('a')).toBe(true)
    toggleFavorite('a')
    expect(isFavorite('a')).toBe(false)
  })

  it('keeps independent keys when toggling', () => {
    const { keys, toggleFavorite } = useFavorites('fav-multi')
    toggleFavorite('a')
    toggleFavorite('b')
    expect(keys.value).toEqual(['a', 'b'])
    toggleFavorite('a')
    expect(keys.value).toEqual(['b'])
  })

  it('persists favorites to localStorage', async () => {
    const { toggleFavorite } = useFavorites('fav-persist')
    toggleFavorite('x')
    await nextTick()
    expect(JSON.parse(localStorage.getItem('fav-persist'))).toEqual(['x'])
  })

  it('filterFavorites returns only favorited items reactively', () => {
    const { toggleFavorite, filterFavorites } = useFavorites('fav-filter')
    const items = ref([{ id: 1 }, { id: 2 }, { id: 3 }])

    const favorites = filterFavorites(items, (item) => item.id)
    expect(favorites.value).toEqual([])

    toggleFavorite(2)
    expect(favorites.value).toEqual([{ id: 2 }])

    toggleFavorite(3)
    expect(favorites.value).toEqual([{ id: 2 }, { id: 3 }])
  })
})
