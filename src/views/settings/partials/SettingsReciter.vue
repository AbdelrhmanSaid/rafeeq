<script setup>
import reciters from '@/exports/QuranReciters.js'
import { useQuranStore } from '@/stores/quran.js'
import { computed } from 'vue'

const quranStore = useQuranStore()

const fullReciters = computed(() => reciters.filter((r) => r.soar_count >= 114))
</script>

<template>
  <div class="form-floating">
    <select
      class="form-select"
      id="currentReciter"
      :value="Number(quranStore.currentReciter)"
      @change="quranStore.changeReciter(Number($event.target.value))"
    >
      <option v-for="reciter in fullReciters" :key="reciter.id" :value="reciter.id">
        {{ reciter.name }} - {{ reciter.rewaya }}
      </option>
    </select>
    <label for="currentReciter">القارئ الحالي</label>
  </div>
</template>
