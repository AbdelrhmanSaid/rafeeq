import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { surahName } from '@/features/quran/lib/mushaf'
import { resetAyahSearchForTests, useAyahSearch } from './useAyahSearch'

const verses = ['بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ', 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', 'مَـٰلِكِ يَوْمِ ٱلدِّينِ']
const serve = () => Promise.resolve(new Response(JSON.stringify(verses), { status: 200 }))
const settle = () => vi.waitFor(flushPromises)

beforeEach(() => resetAyahSearchForTests())
afterEach(() => vi.unstubAllGlobals())

describe('useAyahSearch', () => {
  it('fetches nothing until there is something to search for', async () => {
    const fetch = vi.fn(serve)
    vi.stubGlobal('fetch', fetch)
    const search = ref('')
    const results = reactive(useAyahSearch(search))

    search.value = 'ال'
    await settle()
    expect(fetch).not.toHaveBeenCalled()
    expect(results.isLoading).toBe(false)

    search.value = 'الرحمن'
    await flushPromises()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('lists the ayat that match, each with where to open it', async () => {
    vi.stubGlobal('fetch', vi.fn(serve))
    const results = reactive(useAyahSearch(ref('الرحمن الرحيم')))
    expect(results.isLoading).toBe(true)

    await vi.waitFor(() => expect(results.isLoading).toBe(false))
    expect(results.exact.map((row) => [row.key, row.title, row.page])).toEqual([
      ['1:1', `${surahName(1)} ١`, 1],
      ['1:3', `${surahName(1)} ٣`, 1],
    ])
    expect(results.exact[1].segments).toEqual([{ text: verses[2], hit: true }])
    expect(results.total).toBe(2)
    expect(results.hasMore).toBe(false)
  })

  it('keeps misspelled matches apart from the exact ones', async () => {
    vi.stubGlobal('fetch', vi.fn(serve))
    const results = reactive(useAyahSearch(ref('ملك يوم الدين')))

    await vi.waitFor(() => expect(results.isLoading).toBe(false))
    expect(results.exact).toEqual([])
    expect(results.close.map((row) => row.key)).toEqual(['1:4'])
    expect([results.exactCount, results.closeCount]).toEqual([0, 1])
  })

  it('shows fifty results at a time', async () => {
    const many = Array.from({ length: 120 }, () => verses[2])
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify(many), { status: 200 }))),
    )
    const search = ref('الرحيم')
    const results = reactive(useAyahSearch(search))

    await vi.waitFor(() => expect(results.total).toBe(120))
    expect(results.exact).toHaveLength(50)
    expect(results.hasMore).toBe(true)

    results.showMore()
    results.showMore()
    expect(results.exact).toHaveLength(120)
    expect(results.hasMore).toBe(false)

    search.value = 'الرحمن'
    await flushPromises()
    expect(results.exact).toHaveLength(50)
  })

  it('lists as many results as a caller had left showing', async () => {
    const many = Array.from({ length: 120 }, () => verses[2])
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify(many), { status: 200 }))),
    )
    const shown = ref(100)
    const results = reactive(useAyahSearch(ref('الرحيم'), shown))

    await vi.waitFor(() => expect(results.exact).toHaveLength(100))
    results.showMore()
    expect(shown.value).toBe(150)
  })

  it('reports a text that could not be loaded, and tries again on the next keystroke', async () => {
    const fetch = vi.fn(() => Promise.reject(new TypeError('offline')))
    vi.stubGlobal('fetch', fetch)
    const search = ref('الرحمن')
    const results = reactive(useAyahSearch(search))

    await vi.waitFor(() => expect(results.failed).toBe(true))
    expect(results.isLoading).toBe(false)

    fetch.mockImplementation(serve)
    search.value = 'الرحمن ال'
    await vi.waitFor(() => expect(results.total).toBe(2))
    expect(results.failed).toBe(false)
  })

  it('builds the index once for every list that searches', async () => {
    const fetch = vi.fn(serve)
    vi.stubGlobal('fetch', fetch)
    const first = reactive(useAyahSearch(ref('الحمد')))
    await vi.waitFor(() => expect(first.total).toBe(1))

    const second = reactive(useAyahSearch(ref('الدين')))
    expect(second.exact.map((row) => row.key)).toEqual(['1:4'])
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
