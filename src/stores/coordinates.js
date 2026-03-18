import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

export const useCoordinatesStore = defineStore('coordinates', function () {
  const longitude = useLocalStorage('longitude', 0)
  const latitude = useLocalStorage('latitude', 0)
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
    isDetecting,
    detect,
    clear,
    set,
  }
})
