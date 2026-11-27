import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { AUTO } from '@/features/prayers/constants/calculationOptions'

const roundCoordinate = (value) => Number(value.toFixed(6))

export const usePrayersStore = defineStore('prayers', function () {
  const longitude = useLocalStorage(STORAGE_KEYS.longitude, 0)
  const latitude = useLocalStorage(STORAGE_KEYS.latitude, 0)

  const calcMethod = useLocalStorage(STORAGE_KEYS.prayerCalcMethod, AUTO)
  const calcSchool = useLocalStorage(STORAGE_KEYS.prayerCalcSchool, AUTO)
  const calcLatitudeAdjustment = useLocalStorage(STORAGE_KEYS.prayerCalcLatitudeAdjustment, AUTO)
  const calcShafaq = useLocalStorage(STORAGE_KEYS.prayerCalcShafaq, AUTO)

  const isDetecting = ref(false)

  async function detect() {
    isDetecting.value = true

    try {
      const position = await getCurrentPosition()
      // Saved as numbers, as they read back after a reload; six decimals is about 10 cm, more than a fix is worth.
      longitude.value = roundCoordinate(position.coords.longitude)
      latitude.value = roundCoordinate(position.coords.latitude)
      return { ok: true }
    } catch (error) {
      // A refused or failed fix says nothing about where you are: keep the location already saved.
      return { ok: false, code: error?.code }
    } finally {
      isDetecting.value = false
    }
  }

  function clear() {
    longitude.value = 0
    latitude.value = 0
  }

  return {
    longitude,
    latitude,
    calcMethod,
    calcSchool,
    calcLatitudeAdjustment,
    calcShafaq,
    isDetecting,
    detect,
    clear,
  }
})
