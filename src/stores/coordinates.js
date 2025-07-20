import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useCoordinatesStore = defineStore('coordinates', function () {
  const longitude = useLocalStorage('longitude', 0);
  const latitude = useLocalStorage('latitude', 0);

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

  return {
    longitude,
    latitude,
    detect,
    clear,
    set,
  }
})
