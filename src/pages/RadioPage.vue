<script setup>
import channels from '@/database/radio-channels.js';
import { useAudioStore } from '@/stores/audio.js';

import PlayIcon from '@/components/icons/PlayIcon.vue';
import PauseIcon from '@/components/icons/PauseIcon.vue';

const player = useAudioStore();

const togglePlay = (channel) => {
  if (player.isPlaying && player.currentChannel.url === channel.url) {
    player.stop();
  } else {
    player.play(channel);
  }
};

const isActive = (channel) => player.isPlaying && player.currentChannel.url === channel.url;
</script>

<template>
  <section v-for="channel in channels" :key="channel.url" :class="{ channel: true, active: isActive(channel) }">
    <p>{{ channel.name }}</p>

    <button class="outline" @click="togglePlay(channel)">
      <PauseIcon v-if="isActive(channel)" />
      <PlayIcon v-else />
    </button>
  </section>
</template>

<style lang="scss" scoped>
.channel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem;
  border-bottom: 1px solid #ddd;
  margin: 0;
  gap: 1rem;

  &:last-child {
    border-bottom: none;
  }

  &.active {
    background-color: #e7ded4;
  }

  p {
    margin: 0;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }
}
</style>
