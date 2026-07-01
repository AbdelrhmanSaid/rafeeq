import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { AUTO } from '@/features/prayers/constants/calculationOptions'

export const usePrayersStore = defineStore('prayers', function () {
  const longitude = useLocalStorage(STORAGE_KEYS.longitude, 0)
  const latitude = useLocalStorage(STORAGE_KEYS.latitude, 0)

  // Display layout: 'cards' | 'list' | 'auto'
  const layout = useLocalStorage(STORAGE_KEYS.prayerTimesLayout, 'auto')

  const calcMethod = useLocalStorage(STORAGE_KEYS.prayerCalcMethod, AUTO)
  const calcSchool = useLocalStorage(STORAGE_KEYS.prayerCalcSchool, AUTO)
  const calcLatitudeAdjustment = useLocalStorage(STORAGE_KEYS.prayerCalcLatitudeAdjustment, AUTO)
  const calcMidnightMode = useLocalStorage(STORAGE_KEYS.prayerCalcMidnightMode, AUTO)
  const calcShafaq = useLocalStorage(STORAGE_KEYS.prayerCalcShafaq, AUTO)

  const isCompactViewport = useIsMobile()

  // Effective orientation consumed by <PrayerTimes>
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
      longitude.value = position.coords.longitude.toFixed(6)
      latitude.value = position.coords.latitude.toFixed(6)
      return { ok: true }
    } catch (error) {
      clear()
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
    calcMethod,
    calcSchool,
    calcLatitudeAdjustment,
    calcMidnightMode,
    calcShafaq,
    isDetecting,
    detect,
    clear,
  }
})
