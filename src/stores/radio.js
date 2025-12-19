import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import radios from '@/exports/Radios.js'
import { useLocalStorage } from '@vueuse/core'

export const useRadioStore = defineStore('radio', () => {
  const player = new Audio()

  const station = ref(null)
  const isPlaying = computed(() => station.value !== null)

  const favoriteUrls = useLocalStorage('radioFavorites', [])
  const favorites = computed(() =>
    Object.values(radios).filter((station) => favoriteUrls.value.includes(station.url))
  )

  function play(url) {
    player.src = url
    player.play()

    station.value = url
  }

  function stop() {
    player.src = ''

    station.value = null
  }

  function isFavorite(stationUrl) {
    return favoriteUrls.value.includes(stationUrl)
  }

  function toggleFavorite(stationUrl) {
    if (isFavorite(stationUrl)) {
      favoriteUrls.value = favoriteUrls.value.filter((url) => url !== stationUrl)
    } else {
      favoriteUrls.value.push(stationUrl)
    }
  }

  return {
    station,
    isPlaying,
    favorites,
    play,
    stop,
    isFavorite,
    toggleFavorite,
  }
})
