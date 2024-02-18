import { defineStore } from 'pinia';

export const useAudioStore = defineStore({
  id: 'audio',
  state: () => ({
    audio: new Audio(),
    isPlaying: false,
    currentTrack: null,
  }),
  actions: {
    play(url) {
      if (this.currentTrack !== url) {
        this.audio.src = this.currentTrack = url;
      }

      this.audio.play();
      this.isPlaying = true;
    },
    pause() {
      this.audio.pause();
      this.isPlaying = false;
    },
  },
});
