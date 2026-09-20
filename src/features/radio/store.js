import { watch } from 'vue'
import { defineStore } from 'pinia'
import { useAudioPlayer } from '@/shared/composables/useAudioPlayer'
import {
  setMediaMetadata,
  setMediaHandlers,
  setMediaPlaybackState,
  clearMediaSession,
} from '@/shared/utils/mediaSession'

export const useRadioStore = defineStore('radio', () => {
  const { src: station, isPlaying, status, retryCount, play: playStream, stop: stopStream } = useAudioPlayer()

  function play(url, meta = null) {
    playStream(url)
    setMediaMetadata({ title: meta?.name || 'الإذاعة', artist: 'بث مباشر' })
    setMediaHandlers({
      play: () => play(url, meta),
      pause: stop,
      stop,
    })
  }

  function stop() {
    stopStream()
    clearMediaSession()
  }

  watch(isPlaying, (playing) => {
    if (station.value) setMediaPlaybackState(playing ? 'playing' : 'paused')
  })

  // Failed streams bypass stop(), so clear their stale lock-screen session here.
  watch(status, (value) => {
    if (value === 'failed') clearMediaSession()
  })

  return {
    station,
    isPlaying,
    status,
    retryCount,
    play,
    stop,
  }
})
