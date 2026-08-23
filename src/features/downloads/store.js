import { create } from 'zustand'

import { offlineData } from '@/shared/offline/offlineData'
import { fetchSurah } from '@/features/quran/api'
import { fetchCategory } from '@/features/azkar/api'
import surahs from '@/features/quran/data/surahs.js'
import azkarCategories from '@/features/azkar/data/categories.js'
import { sleep } from '@/shared/utils/async'

// One entry per downloadable asset type — adding a type is data, not new branches.
const ASSET_TYPES = {
  surah: {
    offline: offlineData('quran'),
    assets: surahs.map((surah) => ({
      id: `surah-${surah.id}`,
      type: 'surah',
      name: surah.name,
      key: String(surah.id),
      data: surah,
    })),
    fetch: (asset, signal) => fetchSurah(asset.data.id, { signal }),
  },
  azkar: {
    offline: offlineData('azkar'),
    assets: azkarCategories.map((category) => ({
      id: `azkar-${category.slug}`,
      type: 'azkar',
      name: category.name,
      key: category.slug,
      data: category,
    })),
    fetch: (asset, signal) => fetchCategory(asset.data.slug, { signal }),
  },
}

const types = Object.entries(ASSET_TYPES)

export const ALL_ASSETS = types.flatMap(([, type]) => type.assets)
export const TOTAL_ASSETS = ALL_ASSETS.length

const downloadedKeysSnapshot = () => Object.fromEntries(types.map(([name, type]) => [name, type.offline.getKeys()]))

// Retry policy for a single asset: attempts are spaced by an exponential
// backoff, after which the asset is parked in `failed` until the user retries.
export const MAX_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 1000
const OFFLINE_POLL_MS = 1000
const BETWEEN_ITEMS_MS = 100

const isAbortError = (error) => error?.name === 'AbortError'

// sleep() that resolves early when `signal` aborts.
const sleepUnlessAborted = (ms, signal) =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })

export const useDownloadStore = create((set, get) => ({
  // Mirrors the offline stores so components re-render as downloads land.
  downloadedKeys: downloadedKeysSnapshot(),

  queue: [],
  // Assets that exhausted their retries: id -> { asset, error }.
  failed: {},
  isDownloading: false,
  isPaused: false,
  currentItem: null,

  // The in-flight fetch's controller, so cancel/pause can actually stop it.
  controller: null,

  isDownloaded: (asset) => get().downloadedKeys[asset.type].includes(asset.key),

  isQueued: (asset) => get().queue.some((item) => item.id === asset.id),

  isFailed: (asset) => asset.id in get().failed,

  // Runs the queue until it's empty, paused, or cancelled. Only one worker runs
  // at a time; queueing while it runs just appends to the queue it's draining.
  async processQueue() {
    if (get().isDownloading || get().isPaused || get().queue.length === 0) return

    set({ isDownloading: true })

    try {
      while (get().queue.length > 0 && !get().isPaused) {
        if (!navigator.onLine) {
          await sleep(OFFLINE_POLL_MS)
          continue
        }

        const asset = get().queue[0]
        const outcome = await get().downloadAsset(asset)
        set({ currentItem: null })

        // A paused download stays at the head so resume picks it back up; a
        // downloaded or permanently failed one leaves the queue.
        if (outcome !== 'aborted' && get().queue[0]?.id === asset.id) {
          set((state) => ({ queue: state.queue.slice(1) }))
        }

        await sleep(BETWEEN_ITEMS_MS)
      }
    } finally {
      set({ isDownloading: false, currentItem: null, controller: null })
    }
  },

  // Fetches one asset with bounded retries. Never throws; resolves to
  // 'downloaded' | 'failed' | 'aborted'. A failure while offline is not an
  // attempt: the asset stays at the head of the queue for when the network
  // is back, as does an attempt the user paused or cancelled.
  async downloadAsset(asset) {
    let attempt = 0

    while (attempt < MAX_ATTEMPTS) {
      const controller = new AbortController()
      set({ currentItem: asset, controller })

      try {
        await ASSET_TYPES[asset.type].fetch(asset, controller.signal)
        return 'downloaded'
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return 'aborted'
        if (!navigator.onLine) return 'aborted'

        attempt += 1
        console.error(`Failed to download ${asset.name} (attempt ${attempt}/${MAX_ATTEMPTS}):`, error)
        if (attempt === MAX_ATTEMPTS) break

        // Back off, but let pause/cancel/remove cut the wait short: the
        // controller stays current so their abort() resolves this sleep.
        await sleepUnlessAborted(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), controller.signal)
        if (controller.signal.aborted || !get().isQueued(asset) || get().isPaused) return 'aborted'
      } finally {
        if (get().controller === controller) set({ controller: null })
      }
    }

    set((state) => ({ failed: { ...state.failed, [asset.id]: { asset } } }))
    return 'failed'
  },

  queueAsset(asset) {
    const { isDownloaded, isQueued, processQueue, clearFailed } = get()
    if (isDownloaded(asset) || isQueued(asset)) return

    clearFailed(asset)
    set((state) => ({ queue: [...state.queue, asset] }))
    processQueue()
  },

  queueAllAssets() {
    const { isDownloaded, isQueued, processQueue } = get()
    const pending = ALL_ASSETS.filter((asset) => !isDownloaded(asset) && !isQueued(asset))

    set((state) => ({ queue: [...state.queue, ...pending], failed: {} }))
    processQueue()
  },

  clearFailed(asset) {
    if (!get().isFailed(asset)) return

    set((state) => {
      const failed = { ...state.failed }
      delete failed[asset.id]
      return { failed }
    })
  },

  removeAsset: (asset) => ASSET_TYPES[asset.type].offline.remove(asset.key),

  removeAllAssets: () => Promise.all(types.map(([, type]) => type.offline.removeAll())),

  pauseDownloads() {
    // Abort the in-flight request; the asset stays at the head of the queue
    // and is retried from scratch on resume.
    get().controller?.abort()
    set({ isPaused: true })
  },

  resumeDownloads() {
    set({ isPaused: false })
    get().processQueue()
  },

  cancelAllDownloads() {
    get().controller?.abort()
    set({ queue: [], isPaused: false })
  },

  removeFromQueue(asset) {
    if (get().currentItem?.id === asset.id) get().controller?.abort()
    set((state) => ({ queue: state.queue.filter((item) => item.id !== asset.id) }))
  },
}))

for (const [, type] of types) {
  type.offline.subscribe(() => useDownloadStore.setState({ downloadedKeys: downloadedKeysSnapshot() }))
}

export const selectDownloadedCount = (state) =>
  types.reduce((sum, [name]) => sum + state.downloadedKeys[name].length, 0)

export const selectProgressPercentage = (state) =>
  TOTAL_ASSETS === 0 ? 0 : Math.round((selectDownloadedCount(state) / TOTAL_ASSETS) * 100)

export const selectIsCompleted = (state) => selectDownloadedCount(state) === TOTAL_ASSETS
