import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { AUTO } from '@/features/prayers/constants/calculationOptions'

const roundCoordinate = (value) => Number(value.toFixed(6))

export const usePrayersStore = defineStore('prayers', function () {
  const longitude = useLocalStorage(STORAGE_KEYS.longitude, 0)
  const latitude = useLocalStorage(STORAGE_KEYS.latitude, 0)

  const layout = useLocalStorage(STORAGE_KEYS.prayerTimesLayout, 'auto')

  const calcMethod = useLocalStorage(STORAGE_KEYS.prayerCalcMethod, AUTO)
  const calcSchool = useLocalStorage(STORAGE_KEYS.prayerCalcSchool, AUTO)
  const calcLatitudeAdjustment = useLocalStorage(STORAGE_KEYS.prayerCalcLatitudeAdjustment, AUTO)
  const calcShafaq = useLocalStorage(STORAGE_KEYS.prayerCalcShafaq, AUTO)

  const isCompactViewport = useIsMobile()

  // The automatic layout folds the times into the next-prayer card, on phones and desktop alike.
  const compact = computed(() => layout.value === 'auto')

  const vertical = computed(() => {
    if (layout.value === 'list') return true
    if (layout.value === 'cards') return false
    return isCompactViewport.value
  })

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
    layout,
    vertical,
    compact,
    calcMethod,
    calcSchool,
    calcLatitudeAdjustment,
    calcShafaq,
    isDetecting,
    detect,
    clear,
  }
})
