import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/shared/offline/offlineData', () => {
  const store = () => ({
    getKeys: () => [],
    subscribe: () => () => {},
    get: async () => null,
    save: async () => {},
    remove: async () => {},
    removeAll: async () => {},
  })
  return { offlineData: () => store() }
})

const fetchSurah = vi.fn()
vi.mock('@/features/quran/api', () => ({ fetchSurah: (...args) => fetchSurah(...args) }))
vi.mock('@/features/azkar/api', () => ({ fetchCategory: vi.fn() }))

const { useDownloadStore, ALL_ASSETS, MAX_ATTEMPTS } = await import('./store')

const surah = ALL_ASSETS.find((asset) => asset.type === 'surah')

const flush = () => vi.advanceTimersByTimeAsync(10_000)

describe('useDownloadStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchSurah.mockReset()
    useDownloadStore.setState({
      queue: [],
      failed: {},
      isDownloading: false,
      isPaused: false,
      currentItem: null,
      controller: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('gives up on an asset after bounded retries and marks it failed', async () => {
    fetchSurah.mockRejectedValue(new Error('boom'))

    useDownloadStore.getState().queueAsset(surah)
    await flush()

    const state = useDownloadStore.getState()
    expect(fetchSurah).toHaveBeenCalledTimes(MAX_ATTEMPTS)
    expect(state.queue).toEqual([])
    expect(state.isDownloading).toBe(false)
    expect(state.failed[surah.id]?.asset.id).toBe(surah.id)
  })

  it('keeps an asset queued instead of failing it when the failure happened offline', async () => {
    let reject
    fetchSurah.mockImplementationOnce(() => new Promise((_, r) => (reject = r)))
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    useDownloadStore.getState().queueAsset(surah)
    await vi.advanceTimersByTimeAsync(0)

    // Connectivity drops while the request is in flight, then it fails.
    onLine.mockReturnValue(false)
    reject(new TypeError('Failed to fetch'))
    await vi.advanceTimersByTimeAsync(0)

    // Offline now: not counted as an attempt, still at the head of the queue.
    expect(useDownloadStore.getState().queue.map((item) => item.id)).toEqual([surah.id])
    expect(useDownloadStore.getState().isFailed(surah)).toBe(false)
    expect(useDownloadStore.getState().currentItem).toBeNull()

    fetchSurah.mockResolvedValue({})
    onLine.mockReturnValue(true)
    await flush()
    expect(useDownloadStore.getState().queue).toEqual([])
  })

  it('cuts the retry backoff short on cancel', async () => {
    fetchSurah.mockRejectedValue(new Error('boom'))

    useDownloadStore.getState().queueAsset(surah)
    await vi.advanceTimersByTimeAsync(0)
    // Now inside the 1s backoff after attempt 1.
    useDownloadStore.getState().cancelAllDownloads()
    // Well short of the 1s backoff: only the between-items pause remains.
    await vi.advanceTimersByTimeAsync(200)

    expect(useDownloadStore.getState().isDownloading).toBe(false)
    expect(fetchSurah).toHaveBeenCalledTimes(1)
  })

  it('retries a failed asset when it is queued again', async () => {
    fetchSurah.mockRejectedValue(new Error('boom'))
    useDownloadStore.getState().queueAsset(surah)
    await flush()
    expect(useDownloadStore.getState().isFailed(surah)).toBe(true)

    fetchSurah.mockResolvedValue({})
    useDownloadStore.getState().queueAsset(surah)
    await flush()

    expect(useDownloadStore.getState().isFailed(surah)).toBe(false)
    expect(useDownloadStore.getState().queue).toEqual([])
  })

  it('aborts the in-flight request on cancel', async () => {
    let abortSignal
    fetchSurah.mockImplementation(
      (_id, { signal }) =>
        new Promise((_, reject) => {
          abortSignal = signal
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        }),
    )

    useDownloadStore.getState().queueAsset(surah)
    await vi.advanceTimersByTimeAsync(0)
    expect(useDownloadStore.getState().currentItem?.id).toBe(surah.id)

    useDownloadStore.getState().cancelAllDownloads()
    await flush()

    expect(abortSignal.aborted).toBe(true)
    expect(fetchSurah).toHaveBeenCalledTimes(1)
    const state = useDownloadStore.getState()
    expect(state.isDownloading).toBe(false)
    expect(state.queue).toEqual([])
    expect(state.failed).toEqual({})
  })

  it('keeps a paused asset at the head of the queue and resumes it', async () => {
    fetchSurah.mockImplementationOnce(
      (_id, { signal }) =>
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        }),
    )
    fetchSurah.mockResolvedValue({})

    useDownloadStore.getState().queueAsset(surah)
    await vi.advanceTimersByTimeAsync(0)

    useDownloadStore.getState().pauseDownloads()
    await flush()
    expect(useDownloadStore.getState().queue.map((item) => item.id)).toEqual([surah.id])
    expect(useDownloadStore.getState().isDownloading).toBe(false)

    useDownloadStore.getState().resumeDownloads()
    await flush()
    expect(fetchSurah).toHaveBeenCalledTimes(2)
    expect(useDownloadStore.getState().queue).toEqual([])
  })
})
