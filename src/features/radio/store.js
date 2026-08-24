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

  // meta is the station object ({ name }) shown on the lockscreen player.
  function play(url, meta = null) {
    playStream(url)
    setMediaMetadata({ title: meta?.name || 'الإذاعة', artist: 'بث مباشر' })
    setMediaHandlers({
      // Live streams can't be resumed mid-buffer — "play" restarts the stream.
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

  // A dead stream (retries exhausted) tears down inside useAudioPlayer without
  // going through stop() — and it nulls the src before the isPlaying watch
  // fires, so the guard above skips too. Clear the lockscreen player here or
  // it keeps showing the station as "playing".
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
