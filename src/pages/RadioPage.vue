<script setup>
import channels from '@/database/radio-channels.js';
import { useAudioStore } from '@/stores/audio.js';

const player = useAudioStore();
</script>

<template>
  <ul>
    <li v-for="channel in channels" :key="channel.id">
      {{ channel.name }}

      <button @click="player.play(channel.url)">
        Play
      </button>
    </li>
  </ul>
</template>
