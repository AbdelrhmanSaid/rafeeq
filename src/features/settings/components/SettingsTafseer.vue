<script setup>
import tafseers from '@/features/quran/data/tafseers.js'
import { useQuranStore } from '@/features/quran/store.js'
import { IconBook } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'

const quranStore = useQuranStore()
</script>

<template>
  <SettingsSection title="التفسير" description="اختر تفسير الآيات المفضل لديك" :icon="IconBook">
    <div class="form-floating">
      <select class="form-select" id="currentTafseer" v-model="quranStore.currentTafseer">
        <option v-for="tafseer in tafseers" :key="tafseer.identifier" :value="tafseer.identifier">
          {{ tafseer.name }}
        </option>
      </select>
      <label for="currentTafseer">التفسير الافتراضي</label>
    </div>
  </SettingsSection>
</template>
