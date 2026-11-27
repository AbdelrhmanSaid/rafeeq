import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { resetBookmarksForTests, useQuranBookmarks } from './useQuranBookmarks'

beforeEach(() => {
  localStorage.clear()
  resetBookmarksForTests()
})

describe('useQuranBookmarks', () => {
  it('keeps several bookmarks, newest first, each in its own color', () => {
    const { bookmarks, colors, setBookmark } = useQuranBookmarks()
    setBookmark('2:255', 'gold')
    setBookmark('18:10', 'green')

    expect(bookmarks.value.map((b) => b.key)).toEqual(['18:10', '2:255'])
    expect(colors.value.get('2:255')).toBe('gold')
    expect(colors.value.get('18:10')).toBe('green')
  })

  it('recolors an ayah already bookmarked rather than adding it twice', () => {
    const { bookmarks, colors, setBookmark } = useQuranBookmarks()
    setBookmark('2:255', 'gold')
    setBookmark('2:255', 'blue')

    expect(bookmarks.value).toHaveLength(1)
    expect(colors.value.get('2:255')).toBe('blue')
  })

  it('moves a color to the ayah bookmarked with it last', () => {
    const { bookmarks, setBookmark } = useQuranBookmarks()
    setBookmark('2:255', 'gold')
    setBookmark('18:10', 'green')
    setBookmark('36:12', 'gold')

    expect(bookmarks.value.map((b) => [b.key, b.color])).toEqual([
      ['36:12', 'gold'],
      ['18:10', 'green'],
    ])
  })

  it('takes a color over from the ayah that had it when recoloring', () => {
    const { bookmarks, setBookmark } = useQuranBookmarks()
    setBookmark('2:255', 'gold')
    setBookmark('18:10', 'green')
    setBookmark('18:10', 'gold')

    expect(bookmarks.value.map((b) => [b.key, b.color])).toEqual([['18:10', 'gold']])
  })

  it('removes a bookmark', () => {
    const { bookmarks, setBookmark, removeBookmark } = useQuranBookmarks()
    setBookmark('2:255', 'gold')
    removeBookmark('2:255')

    expect(bookmarks.value).toEqual([])
  })

  it('ignores ayat and colors that do not exist', () => {
    const { bookmarks, setBookmark } = useQuranBookmarks()
    setBookmark('1:8', 'gold')
    setBookmark('2:255', 'black')

    expect(bookmarks.value).toEqual([])
  })

  it('carries the old single bookmark over as a gold one', () => {
    localStorage.setItem(
      STORAGE_KEYS.quranBookmark,
      JSON.stringify({ surahId: 36, surahName: 'يس', ayahNumber: 12, text: '…' }),
    )
    const { bookmarks } = useQuranBookmarks()

    expect(bookmarks.value.map((b) => [b.key, b.color])).toEqual([['36:12', 'gold']])
    expect(localStorage.getItem(STORAGE_KEYS.quranBookmark)).toBe(null)
  })

  it('reads damaged storage as no bookmarks', () => {
    localStorage.setItem(STORAGE_KEYS.quranBookmarks, '{not json')
    const { bookmarks } = useQuranBookmarks()

    expect(bookmarks.value).toEqual([])
  })

  it('keeps saving after the screen that first used it is gone', async () => {
    const wrapper = mount(defineComponent({ setup: () => useQuranBookmarks(), render: () => null }))
    wrapper.unmount()

    useQuranBookmarks().setBookmark('2:255', 'gold')
    await nextTick()

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.quranBookmarks))).toHaveLength(1)
  })
})
