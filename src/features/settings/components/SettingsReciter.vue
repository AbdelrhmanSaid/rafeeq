<script setup>
import reciters from '@/features/quran/data/reciters.js'
import { useQuranStore } from '@/features/quran/store.js'
import { computed } from 'vue'
import { IconMicrophone2 } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'
import SelectRow from '@/shared/ui/SelectRow.vue'

const quranStore = useQuranStore()
const normalize = (s) => s.replace(/\s+/g, ' ')

const fullReciters = reciters.filter((r) => r.soar_count >= 114).map((r) => ({ ...r, rewaya: normalize(r.rewaya) }))

const rewayat = [...new Set(fullReciters.map((r) => r.rewaya))]
const currentRewaya = computed(() => normalize(quranStore.reciter?.rewaya ?? '') || rewayat[0])
const filteredReciters = computed(() => fullReciters.filter((r) => r.rewaya === currentRewaya.value))

const rewayaOptions = rewayat.map((rewaya) => ({ value: rewaya, label: rewaya }))
const reciterOptions = computed(() =>
  filteredReciters.value.map((reciter) => ({ value: reciter.id, label: reciter.name })),
)

function onRewayaChange(value) {
  const first = fullReciters.find((r) => r.rewaya === value)
  if (first) quranStore.changeReciter(first.id)
}
</script>

<template>
  <SettingsSection title="القرآن الكريم" description="اختر الرواية والقارئ المفضل لديك" :icon="IconMicrophone2">
    <div class="row-group row-group--flush">
      <SelectRow
        label="الرواية"
        :model-value="currentRewaya"
        :options="rewayaOptions"
        @update:model-value="onRewayaChange"
      />
      <SelectRow
        label="القارئ"
        :model-value="Number(quranStore.currentReciter)"
        :options="reciterOptions"
        @update:model-value="quranStore.changeReciter"
      />
    </div>
  </SettingsSection>
</template>
