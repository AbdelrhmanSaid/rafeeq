import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import radios from '@/exports/Radios.js'
import { useLocalStorage } from '@vueuse/core'

export const useRadioStore = defineStore('radio', () => {
  const player = new Audio()

  const station = ref(null)
  const isPlaying = computed(() => station.value !== null)

  const favoriteIds = useLocalStorage('radioFavorites', [])
  const favorites = computed(() => radios.filter((station) => favoriteIds.value.includes(station.id)))

  function play(url) {
    player.src = url
    player.play()

    station.value = url
  }

  function stop() {
    player.src = ''

    station.value = null
  }

  function isFavorite(stationId) {
    return favoriteIds.value.includes(stationId)
  }

  function toggleFavorite(stationId) {
    if (isFavorite(stationId)) {
      favoriteIds.value = favoriteIds.value.filter((id) => id !== stationId)
    } else {
      favoriteIds.value.push(stationId)
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
