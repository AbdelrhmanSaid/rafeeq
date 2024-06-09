import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRadioStore = defineStore('radio', () => {
  const player = new Audio()

  const station = ref(null)
  const isPlaying = computed(() => station.value !== null)

  function play(url) {
    player.src = url
    player.play()

    station.value = url
  }

  function stop() {
    player.src = ''

    station.value = null
  }

  return { station, isPlaying, play, stop }
})
