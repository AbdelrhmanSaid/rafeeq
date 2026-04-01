<script setup>
import reciters from '@/exports/QuranReciters.js'
import { useQuranStore } from '@/stores/quran.js'
import { computed } from 'vue'

const quranStore = useQuranStore()
const normalize = (s) => s.replace(/\s+/g, ' ')

const fullReciters = reciters.filter((r) => r.soar_count >= 114).map((r) => ({ ...r, rewaya: normalize(r.rewaya) }))

const rewayat = computed(() => [...new Set(fullReciters.map((r) => r.rewaya))])
const currentRewaya = computed(() => normalize(quranStore.reciter?.rewaya ?? '') || rewayat.value[0])
const filteredReciters = computed(() => fullReciters.filter((r) => r.rewaya === currentRewaya.value))

function onRewayaChange(value) {
  const first = fullReciters.find((r) => r.rewaya === value)
  if (first) quranStore.changeReciter(first.id)
}
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h6 class="card-title mb-3">القرآن الكريم</h6>

      <div class="mb-3">
        <span class="d-block mb-2">الرواية</span>
        <div class="form-floating">
          <select
            class="form-select"
            id="currentRewaya"
            :value="currentRewaya"
            @change="onRewayaChange($event.target.value)"
          >
            <option v-for="rewaya in rewayat" :key="rewaya" :value="rewaya">
              {{ rewaya }}
            </option>
          </select>
          <label for="currentRewaya">الرواية</label>
        </div>
      </div>

      <div>
        <span class="d-block mb-2">القارئ</span>
        <div class="form-floating">
          <select
            class="form-select"
            id="currentReciter"
            :value="Number(quranStore.currentReciter)"
            @change="quranStore.changeReciter(Number($event.target.value))"
          >
            <option v-for="reciter in filteredReciters" :key="reciter.id" :value="reciter.id">
              {{ reciter.name }}
            </option>
          </select>
          <label for="currentReciter">القارئ الحالي</label>
        </div>
      </div>
    </div>
  </div>
</template>
