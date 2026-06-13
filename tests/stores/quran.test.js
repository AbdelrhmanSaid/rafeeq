import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuranStore } from '@/stores/quran'
import reciters from '@/exports/QuranReciters.js'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('quran store - reciter', () => {
  it('defaults to reciter id 51', () => {
    const store = useQuranStore()
    expect(Number(store.currentReciter)).toBe(51)
    expect(store.reciter).toBeDefined()
    expect(store.reciter.id).toBe(51)
  })

  it('falls back to the default reciter when an unknown id is set', async () => {
    const store = useQuranStore()
    store.currentReciter = 99999
    // watcher resets invalid reciter back to the default
    await Promise.resolve()
    expect(Number(store.currentReciter)).toBe(51)
  })

  it('zero-pads the surah number to three digits in the audio URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
    const store = useQuranStore()
    const reciter = reciters.find((r) => r.id === 51)

    await store.loadSurahAudio(7, 'الأعراف')
    expect(store.surahAudioUrl).toBe(`${reciter.folder_url}007.mp3`)

    await store.loadSurahAudio(114, 'الناس')
    expect(store.surahAudioUrl).toBe(`${reciter.folder_url}114.mp3`)
  })
})

describe('quran store - ayah timings', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { ayah: 1, start_time: 0 },
          { ayah: 2, start_time: 5000 },
          { ayah: 3, start_time: 10000 },
        ],
      }),
    )
  })

  it('loadSurahAudio sets the audio URL, name and fetches timings', async () => {
    const store = useQuranStore()
    await store.loadSurahAudio(1, 'الفاتحة')

    expect(store.surahName).toBe('الفاتحة')
    expect(store.currentSurahNumber).toBe(1)
    expect(store.surahAudioUrl).toMatch(/001\.mp3$/)
    expect(store.ayahTimings).toHaveLength(3)
  })

  it('updateCurrentAyahFromTime selects the latest passed timing', async () => {
    const store = useQuranStore()
    await store.loadSurahAudio(1, 'الفاتحة')

    store.updateCurrentAyahFromTime(0)
    expect(store.currentAyah).toEqual({ ayah: 1, start_time: 0 })

    store.updateCurrentAyahFromTime(6000)
    expect(store.currentAyah).toEqual({ ayah: 2, start_time: 5000 })

    store.updateCurrentAyahFromTime(99999)
    expect(store.currentAyah).toEqual({ ayah: 3, start_time: 10000 })
  })

  it('getAyahStartTime returns seconds, or null when not found', async () => {
    const store = useQuranStore()
    await store.loadSurahAudio(1, 'الفاتحة')

    expect(store.getAyahStartTime(2)).toBe(5)
    expect(store.getAyahStartTime(404)).toBeNull()
  })

  it('resetAyahTracking clears the current ayah', async () => {
    const store = useQuranStore()
    await store.loadSurahAudio(1, 'الفاتحة')
    store.updateCurrentAyahFromTime(6000)
    expect(store.currentAyah).not.toBeNull()

    store.resetAyahTracking()
    expect(store.currentAyah).toBeNull()
  })

  it('falls back to an empty timings list when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const store = useQuranStore()
    await store.loadSurahAudio(2, 'البقرة')
    expect(store.ayahTimings).toEqual([])
  })

  it('changeReciter reloads audio for the current surah', async () => {
    const store = useQuranStore()
    await store.loadSurahAudio(1, 'الفاتحة')
    const otherReciter = reciters.find((r) => r.id !== 51)

    await store.changeReciter(otherReciter.id)
    expect(Number(store.currentReciter)).toBe(otherReciter.id)
    expect(store.surahAudioUrl).toContain(otherReciter.folder_url)
  })
})
