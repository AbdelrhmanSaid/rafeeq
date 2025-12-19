import { defineStore } from 'pinia'

export const useRadioStore = defineStore('radio', () => {
  const station = ref(null)
  const audio = ref(null)
  const favorites = ref([])
  const isPlaying = ref(false)

  // Initialize from localStorage on client
  if (import.meta.client) {
    const stored = localStorage.getItem('radioFavorites')
    if (stored) {
      try {
        favorites.value = JSON.parse(stored)
      } catch (e) {
        favorites.value = []
      }
    }
  }

  // Watch for changes and persist
  watch(favorites, (newValue) => {
    if (import.meta.client) {
      localStorage.setItem('radioFavorites', JSON.stringify(newValue))
    }
  }, { deep: true })

  const play = (url) => {
    if (!import.meta.client) return
    
    if (audio.value) {
      audio.value.pause()
    }

    audio.value = new Audio(url)
    audio.value.play()
    station.value = url
    isPlaying.value = true

    audio.value.addEventListener('ended', () => {
      isPlaying.value = false
    })

    audio.value.addEventListener('pause', () => {
      isPlaying.value = false
    })

    audio.value.addEventListener('play', () => {
      isPlaying.value = true
    })
  }

  const stop = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value = null
    }
    station.value = null
    isPlaying.value = false
  }

  const toggleFavorite = (slug) => {
    const index = favorites.value.indexOf(slug)
    if (index === -1) {
      favorites.value.push(slug)
    } else {
      favorites.value.splice(index, 1)
    }
  }

  const isFavorite = (slug) => {
    return favorites.value.includes(slug)
  }

  return {
    station,
    favorites,
    isPlaying,
    play,
    stop,
    toggleFavorite,
    isFavorite,
  }
})
