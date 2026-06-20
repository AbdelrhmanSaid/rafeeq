import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

export const usePrayersStore = defineStore('prayers', function () {
  const longitude = useLocalStorage(STORAGE_KEYS.longitude, 0)
  const latitude = useLocalStorage(STORAGE_KEYS.latitude, 0)

  // Display layout: 'cards' | 'list' | 'auto'
  const layout = useLocalStorage(STORAGE_KEYS.prayerTimesLayout, 'auto')

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
    isDetecting,
    detect,
    clear,
  }
})
