<script setup>
import reciters from '@/exports/QuranReciters.js'
import { useQuranStore } from '@/stores/quran.js'
import { computed } from 'vue'

const quranStore = useQuranStore()

const recitersByRewaya = computed(() => {
  const groups = new Map()
  for (const r of reciters) {
    if (r.soar_count < 114) continue
    const key = r.rewaya.replace(/\s+/g, ' ')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }

  return groups
})
</script>

<template>
  <div class="form-floating">
    <select
      class="form-select"
      id="currentReciter"
      :value="Number(quranStore.currentReciter)"
      @change="quranStore.changeReciter(Number($event.target.value))"
    >
      <optgroup v-for="[rewaya, group] in recitersByRewaya" :key="rewaya" :label="rewaya">
        <option v-for="reciter in group" :key="reciter.id" :value="reciter.id">
          {{ reciter.name }}
        </option>
      </optgroup>
    </select>
    <label for="currentReciter">القارئ الحالي</label>
  </div>
</template>
