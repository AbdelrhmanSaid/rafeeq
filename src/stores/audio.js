import { defineStore } from 'pinia';

export const useAudioStore = defineStore({
  id: 'audio',
  state: () => ({
    audio: new Audio(),
    isPlaying: false,
    currentChannel: null,
  }),
  actions: {
    play(channel) {
      if (this.currentChannel !== channel) {
        this.currentChannel = channel;
        this.audio.src = channel.url;
      }

      this.audio.play();
      this.isPlaying = true;
    },
    stop() {
      this.audio.pause();
      this.isPlaying = false;

      this.audio.url = '';
      this.currentChannel = null;
    },
  },
});
