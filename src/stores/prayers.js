import { defineStore } from 'pinia'
import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

export const usePrayersStore = defineStore('prayers', function () {
  const longitude = useLocalStorage('longitude', 0)
  const latitude = useLocalStorage('latitude', 0)

  // Display layout: 'cards' | 'list' | 'auto'
  const layout = useLocalStorage('prayer-times-layout', 'auto')

  // Mobile/tablet viewports (below Bootstrap's lg breakpoint)
  const isCompactViewport = useMediaQuery('(max-width: 991.98px)')

  // Effective orientation consumed by <PrayerTimes>
  const vertical = computed(() => {
    if (layout.value === 'list') return true
    if (layout.value === 'cards') return false
    return isCompactViewport.value
  })

  const isDetecting = ref(false)

  function detect() {
    isDetecting.value = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        longitude.value = position.coords.longitude.toFixed(6)
        latitude.value = position.coords.latitude.toFixed(6)
        isDetecting.value = false

        toast.success('تم تحديد الموقع بنجاح.')
      },
      (error) => {
        const messagesMap = {
          1: 'تم رفض إذن الوصول للموقع. يمكنك تفعيله من إعدادات المتصفح.',
          2: 'الموقع غير متاح حالياً. يمكنك المحاولة مرة أخرى.',
          3: 'فشل في تحديد الموقع. يمكنك المحاولة مرة أخرى.',
        }

        toast.error(messagesMap[error.code] || 'حدث خطأ أثناء تحديد الموقع. يمكنك المحاولة مرة أخرى.')
        clear()

        isDetecting.value = false
      },
    )
  }

  function clear() {
    longitude.value = 0
    latitude.value = 0
  }

  function set(longitude, latitude) {
    longitude.value = longitude
    latitude.value = latitude
  }

  return {
    longitude,
    latitude,
    layout,
    vertical,
    isDetecting,
    detect,
    clear,
    set,
  }
})
