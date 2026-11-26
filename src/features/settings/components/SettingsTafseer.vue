<script setup>
import tafseers from '@/features/quran/data/tafseers.js'
import { useQuranStore } from '@/features/quran/store.js'
import { IconBook } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'
import SelectRow from '@/shared/ui/SelectRow.vue'

const tafseerOptions = tafseers.map((tafseer) => ({ value: tafseer.identifier, label: tafseer.name }))

const quranStore = useQuranStore()
</script>

<template>
  <SettingsSection title="التفسير" description="اختر التفسير الافتراضي للآيات" :icon="IconBook">
    <div class="row-group row-group--flush">
      <SelectRow v-model="quranStore.currentTafseer" label="التفسير الافتراضي" :options="tafseerOptions" />
    </div>
  </SettingsSection>
</template>
