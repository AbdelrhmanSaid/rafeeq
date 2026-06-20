import { defineStore } from 'pinia'
import { useAudioPlayer } from '@/shared/composables/useAudioPlayer'

export const useRadioStore = defineStore('radio', () => {
  const { src: station, isPlaying, status, retryCount, play, stop } = useAudioPlayer()

  return {
    station,
    isPlaying,
    status,
    retryCount,
    play,
    stop,
  }
})
