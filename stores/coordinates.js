import { defineStore } from 'pinia'

export const useCoordinatesStore = defineStore('coordinates', () => {
  const latitude = ref(0)
  const longitude = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Initialize from localStorage on client
  if (import.meta.client) {
    const storedLat = localStorage.getItem('latitude')
    const storedLng = localStorage.getItem('longitude')
    if (storedLat) latitude.value = parseFloat(storedLat)
    if (storedLng) longitude.value = parseFloat(storedLng)
  }

  // Watch for changes and persist
  watch([latitude, longitude], ([lat, lng]) => {
    if (import.meta.client) {
      localStorage.setItem('latitude', lat.toString())
      localStorage.setItem('longitude', lng.toString())
    }
  })

  const detect = async () => {
    if (!import.meta.client) return
    
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by your browser'
      return
    }

    loading.value = true
    error.value = null

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    latitude.value = 0
    longitude.value = 0
    if (import.meta.client) {
      localStorage.removeItem('latitude')
      localStorage.removeItem('longitude')
    }
  }

  return {
    latitude,
    longitude,
    loading,
    error,
    detect,
    clear,
  }
})
