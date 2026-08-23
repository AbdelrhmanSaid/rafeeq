import { create } from 'zustand'
import { persistFields } from '@/shared/lib/persist'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const DEFAULT_ZEKR_VIBRATION_INTENSITY = 60

// App-wide preferences that don't belong to a single feature.
export const useAppStore = create(
  persistFields({
    autoUpdateServiceWorker: STORAGE_KEYS.autoUpdateServiceWorker,
    zekrVibrationEnabled: STORAGE_KEYS.zekrVibrationEnabled,
    zekrVibrationIntensity: STORAGE_KEYS.zekrVibrationIntensity,
    zekrMoveNextOnComplete: STORAGE_KEYS.zekrMoveNextOnComplete,
    zekrSaveProgress: STORAGE_KEYS.zekrSaveProgress,
    zekrConfirmOnLeave: STORAGE_KEYS.zekrConfirmOnLeave,
  })((set) => ({
    autoUpdateServiceWorker: true,

    zekrVibrationEnabled: true,
    zekrVibrationIntensity: DEFAULT_ZEKR_VIBRATION_INTENSITY,
    zekrMoveNextOnComplete: false,
    zekrSaveProgress: true,
    zekrConfirmOnLeave: true,

    setAutoUpdateServiceWorker: (enabled) => set({ autoUpdateServiceWorker: enabled }),
    setZekrVibrationEnabled: (enabled) => set({ zekrVibrationEnabled: enabled }),
    setZekrVibrationIntensity: (intensity) =>
      set({
        zekrVibrationIntensity: Number.isFinite(intensity) ? intensity : DEFAULT_ZEKR_VIBRATION_INTENSITY,
      }),
    setZekrMoveNextOnComplete: (enabled) => set({ zekrMoveNextOnComplete: enabled }),
    setZekrSaveProgress: (enabled) => set({ zekrSaveProgress: enabled }),
    setZekrConfirmOnLeave: (enabled) => set({ zekrConfirmOnLeave: enabled }),
  })),
)
