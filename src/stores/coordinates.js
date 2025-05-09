import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export const useCoordinatesStore = defineStore('coordinates', function () {
  const longitude = ref(+localStorage.getItem('longitude') || 0)
  const latitude = ref(+localStorage.getItem('latitude') || 0)

  function detect() {
    navigator.geolocation.getCurrentPosition((position) => {
      longitude.value = position.coords.longitude
      latitude.value = position.coords.latitude
    })
  }

  function clear() {
    longitude.value = 0
    latitude.value = 0
  }

  function set(longitude, latitude) {
    longitude.value = longitude
    latitude.value = latitude
  }

  watchEffect(() => {
    localStorage.setItem('longitude', longitude.value)
    localStorage.setItem('latitude', latitude.value)
  })

  return {
    longitude,
    latitude,
    detect,
    clear,
    set,
  }
})
