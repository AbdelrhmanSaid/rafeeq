import { create } from 'zustand'
import { createAudioPlayer } from '@/shared/lib/audioPlayer'

// The radio plays across route changes, so a single player instance lives with
// the store rather than with any component.
export const useRadioStore = create((set) => {
  const player = createAudioPlayer({
    onChange: ({ src, isPlaying, status, retryCount }) => set({ station: src, isPlaying, status, retryCount }),
  })

  return {
    station: null,
    isPlaying: false,
    status: 'idle',
    retryCount: 0,

    play: player.play,
    stop: player.stop,
  }
})
