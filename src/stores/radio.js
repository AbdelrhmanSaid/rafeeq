import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import radios from '@/exports/Radios.js'
import { useLocalStorage } from '@vueuse/core'

export const useRadioStore = defineStore('radio', () => {
  const player = new Audio()

  const station = ref(null)
  const isPlaying = computed(() => station.value !== null)

  const favoriteKeys = useLocalStorage('radioFavorites', []).map((key) => key.toLowerCase())
  const favorites = computed(() =>
    Object.entries(radios)
      .filter(([slug]) => favoriteKeys.value.includes(slug))
      .map(([slug, station]) => ({ slug, ...station })),
  )

  const getSlugForUrl = (url) => Object.entries(radios).find(([, station]) => station.url === url)?.[0]

  if (favoriteKeys.value.some((favorite) => !radios[favorite])) {
    favoriteKeys.value = Array.from(
      new Set(
        favoriteKeys.value.map((favorite) => (radios[favorite] ? favorite : getSlugForUrl(favorite))).filter(Boolean),
      ),
    )
  }

  function play(url) {
    player.src = url
    player.play()

    station.value = url
  }

  function stop() {
    player.src = ''

    station.value = null
  }

  function isFavorite(stationSlug) {
    return favoriteKeys.value.includes(stationSlug)
  }

  function toggleFavorite(stationSlug) {
    if (isFavorite(stationSlug)) {
      favoriteKeys.value = favoriteKeys.value.filter((slug) => slug !== stationSlug)
    } else {
      favoriteKeys.value.push(stationSlug)
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
