<script setup>
import { IconMicrophone2 } from '@tabler/icons-vue'
import { useReciterSelection } from '@/features/quran/composables/useReciterSelection.js'
import SettingsSection from './SettingsSection.vue'

const { rewayat, currentRewaya, filteredReciters, currentReciterId, selectRewaya, selectReciter } =
  useReciterSelection()
</script>

<template>
  <SettingsSection title="القرآن الكريم" description="اختر الرواية والقارئ المفضل لديك" :icon="IconMicrophone2">
    <div class="mb-3">
      <span class="d-block mb-2">الرواية</span>
      <div class="form-floating">
        <select
          class="form-select"
          id="currentRewaya"
          :value="currentRewaya"
          @change="selectRewaya($event.target.value)"
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
          :value="currentReciterId"
          @change="selectReciter($event.target.value)"
        >
          <option v-for="reciter in filteredReciters" :key="reciter.id" :value="reciter.id">
            {{ reciter.name }}
          </option>
        </select>
        <label for="currentReciter">القارئ الحالي</label>
      </div>
    </div>
  </SettingsSection>
</template>
