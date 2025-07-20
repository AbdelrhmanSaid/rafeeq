<script setup>
import reciters from '@/exports/QuranReciters.js'
import { useQuranStore } from '@/stores/quran.js'

const quranStore = useQuranStore()
</script>

<template>
  <div class="form-floating">
    <select
      class="form-select"
      type="text"
      id="currentReciter"
      :value="quranStore.currentReciter"
      @change="quranStore.changeReciter($event.target.value)"
    >
      <option v-for="(name, key) in reciters" :key="key" :value="key">{{ name }}</option>
    </select>
    <label for="currentReciter">القارئ الحالي</label>
  </div>
</template>
