import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import reciters from '@/features/quran/data/reciters.js'
import { useQuranStore } from './store'

const DEFAULT_RECITER_ID = 51

const TIMINGS = [
  { ayah: 1, start_time: 0 },
  { ayah: 2, start_time: 5000 },
  { ayah: 3, start_time: 9000 },
]

const mockFetch = (timings = TIMINGS, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({ ok, json: async () => timings })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('reciter selection', () => {
  it('defaults to the configured reciter', () => {
    const store = useQuranStore()
    expect(store.reciter.id).toBe(DEFAULT_RECITER_ID)
  })

  it('resolves the reciter chosen via changeReciter', () => {
    const store = useQuranStore()
    store.changeReciter(1)
    expect(store.reciter.id).toBe(1)
  })

  it('falls back to the default when the stored reciter is unknown', async () => {
    localStorage.setItem('currentReciter', '999999')
    const store = useQuranStore()
    await nextTick()
    expect(store.reciter.id).toBe(DEFAULT_RECITER_ID)
  })
})

describe('loadSurahAudio', () => {
  it('builds a zero-padded audio URL from the reciter folder', async () => {
    mockFetch()
    const store = useQuranStore()
    const { folder_url } = reciters.find((r) => r.id === DEFAULT_RECITER_ID)

    await store.loadSurahAudio(2, 'البقرة')

    expect(store.surahAudioUrl).toBe(`${folder_url}002.mp3`)
    expect(store.surahName).toBe('البقرة')
  })

  it('requests timings for the active surah and reciter', async () => {
    mockFetch()
    const store = useQuranStore()

    await store.loadSurahAudio(2, 'البقرة')

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`ayat_timing?surah=2&read=${DEFAULT_RECITER_ID}`))
  })

  it('swallows fetch failures and leaves no timings', async () => {
    mockFetch([], false)
    const store = useQuranStore()

    await store.loadSurahAudio(2, 'البقرة')

    expect(store.currentAyah).toBeNull()
    expect(store.getAyahStartTime(1)).toBeNull()
  })
})

describe('ayah tracking', () => {
  it('maps playback time to the current ayah', async () => {
    mockFetch()
    const store = useQuranStore()
    await store.loadSurahAudio(2, 'البقرة')

    store.updateCurrentAyahFromTime(0)
    expect(store.currentAyah.ayah).toBe(1)

    store.updateCurrentAyahFromTime(6000)
    expect(store.currentAyah.ayah).toBe(2)

    store.updateCurrentAyahFromTime(100000)
    expect(store.currentAyah.ayah).toBe(3)
  })

  it('resets tracking back to no current ayah', async () => {
    mockFetch()
    const store = useQuranStore()
    await store.loadSurahAudio(2, 'البقرة')

    store.updateCurrentAyahFromTime(6000)
    store.resetAyahTracking()
    expect(store.currentAyah).toBeNull()
  })

  it('returns an ayah start time in seconds, or null when unknown', async () => {
    mockFetch()
    const store = useQuranStore()
    await store.loadSurahAudio(2, 'البقرة')

    expect(store.getAyahStartTime(2)).toBe(5)
    expect(store.getAyahStartTime(99)).toBeNull()
  })
})

describe('reloadSurahAudio', () => {
  it('does nothing before any surah has been loaded', () => {
    const store = useQuranStore()
    expect(store.reloadSurahAudio()).toBeUndefined()
  })

  it('reloads the active surah after a reciter change', async () => {
    mockFetch()
    const store = useQuranStore()
    await store.loadSurahAudio(2, 'البقرة')

    // changeReciter defers the (potentially large) reload to reloadSurahAudio.
    store.changeReciter(1)
    const { folder_url } = reciters.find((r) => r.id === 1)

    await store.reloadSurahAudio()
    expect(store.surahAudioUrl).toBe(`${folder_url}002.mp3`)
  })
})
