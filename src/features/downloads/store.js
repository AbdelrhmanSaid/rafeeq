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
    fetch: (asset) => fetchSurah(asset.data.id),
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
    fetch: (asset) => fetchCategory(asset.data.slug),
  },
}

const types = Object.entries(ASSET_TYPES)

export const ALL_ASSETS = types.flatMap(([, type]) => type.assets)
export const TOTAL_ASSETS = ALL_ASSETS.length

const downloadedKeysSnapshot = () => Object.fromEntries(types.map(([name, type]) => [name, type.offline.getKeys()]))

export const useDownloadStore = create((set, get) => ({
  // Mirrors the offline stores so components re-render as downloads land.
  downloadedKeys: downloadedKeysSnapshot(),

  queue: [],
  isDownloading: false,
  isPaused: false,
  currentItem: null,

  isDownloaded: (asset) => get().downloadedKeys[asset.type].includes(asset.key),

  isQueued: (asset) => get().queue.some((item) => item.id === asset.id),

  async processQueue() {
    if (get().isDownloading || get().isPaused || get().queue.length === 0) return

    set({ isDownloading: true })

    while (get().queue.length > 0 && !get().isPaused) {
      if (!navigator.onLine) {
        await sleep(1000)
        continue
      }

      const asset = get().queue[0]
      set({ currentItem: asset })

      try {
        await ASSET_TYPES[asset.type].fetch(asset)
        set((state) => ({ queue: state.queue.slice(1) }))
        await sleep(100)
      } catch (error) {
        console.error(`Failed to download ${asset.name}:`, error)
        // Send the failure to the back of the queue and keep going.
        set((state) => ({ queue: [...state.queue.slice(1), asset] }))
        await sleep(1000)
      }
    }

    set({ isDownloading: false, currentItem: null })
  },

  queueAsset(asset) {
    const { isDownloaded, isQueued, processQueue } = get()
    if (isDownloaded(asset) || isQueued(asset)) return

    set((state) => ({ queue: [...state.queue, asset] }))
    processQueue()
  },

  queueAllAssets() {
    const { isDownloaded, isQueued, processQueue } = get()
    const pending = ALL_ASSETS.filter((asset) => !isDownloaded(asset) && !isQueued(asset))

    set((state) => ({ queue: [...state.queue, ...pending] }))
    processQueue()
  },

  removeAsset: (asset) => ASSET_TYPES[asset.type].offline.remove(asset.key),

  removeAllAssets: () => Promise.all(types.map(([, type]) => type.offline.removeAll())),

  pauseDownloads: () => set({ isPaused: true }),

  resumeDownloads() {
    set({ isPaused: false })
    get().processQueue()
  },

  cancelAllDownloads: () => set({ queue: [], isPaused: false }),

  removeFromQueue: (asset) => set((state) => ({ queue: state.queue.filter((item) => item.id !== asset.id) })),
}))

for (const [, type] of types) {
  type.offline.subscribe(() => useDownloadStore.setState({ downloadedKeys: downloadedKeysSnapshot() }))
}

export const selectDownloadedCount = (state) =>
  types.reduce((sum, [name]) => sum + state.downloadedKeys[name].length, 0)

export const selectProgressPercentage = (state) =>
  TOTAL_ASSETS === 0 ? 0 : Math.round((selectDownloadedCount(state) / TOTAL_ASSETS) * 100)

export const selectIsCompleted = (state) => selectDownloadedCount(state) === TOTAL_ASSETS
