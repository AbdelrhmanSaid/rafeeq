import { create } from 'zustand'
import { persistFields } from '@/shared/lib/persist'
import { getCurrentPosition } from '@/shared/lib/geolocation'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { AUTO, CALCULATION_FIELDS } from '@/features/prayers/constants/calculationOptions'

export const usePrayersStore = create(
  persistFields({
    longitude: STORAGE_KEYS.longitude,
    latitude: STORAGE_KEYS.latitude,
    layout: STORAGE_KEYS.prayerTimesLayout,
    calcMethod: STORAGE_KEYS.prayerCalcMethod,
    calcSchool: STORAGE_KEYS.prayerCalcSchool,
    calcLatitudeAdjustment: STORAGE_KEYS.prayerCalcLatitudeAdjustment,
    calcMidnightMode: STORAGE_KEYS.prayerCalcMidnightMode,
    calcShafaq: STORAGE_KEYS.prayerCalcShafaq,
  })((set, get) => ({
    longitude: 0,
    latitude: 0,

    // Display layout: 'cards' | 'list' | 'auto'
    layout: 'auto',

    calcMethod: AUTO,
    calcSchool: AUTO,
    calcLatitudeAdjustment: AUTO,
    calcMidnightMode: AUTO,
    calcShafaq: AUTO,

    isDetecting: false,

    setLayout: (layout) => set({ layout }),
    setCalculationField: (field, value) => set({ [field]: value }),

    async detect() {
      set({ isDetecting: true })

      try {
        const position = await getCurrentPosition()
        set({
          longitude: Number(position.coords.longitude.toFixed(6)),
          latitude: Number(position.coords.latitude.toFixed(6)),
        })
        return { ok: true }
      } catch (error) {
        get().clear()
        return { ok: false, code: error?.code }
      } finally {
        set({ isDetecting: false })
      }
    },

    clear: () => set({ longitude: 0, latitude: 0 }),
  })),
)

export const selectHasLocation = (state) => state.latitude !== 0 && state.longitude !== 0

// Query string for the calculation options the user has changed from 'auto'.
export const selectCalculationParams = (state) =>
  CALCULATION_FIELDS.filter(({ key }) => state[key])
    .map(({ param, key }) => `${param}=${encodeURIComponent(state[key])}`)
    .join('&')
