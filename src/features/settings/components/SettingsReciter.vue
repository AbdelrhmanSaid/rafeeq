<script setup>
import reciters from '@/features/quran/data/reciters.js'
import { useQuranStore } from '@/features/quran/store.js'
import { computed } from 'vue'
import { IconMicrophone2 } from '@tabler/icons-vue'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import SettingsSection from './SettingsSection.vue'

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
  <SettingsSection title="القرآن الكريم" description="اختر الرواية والقارئ المفضل لديك" :icon="IconMicrophone2">
    <div class="grid gap-2">
      <Label for="currentRewaya">الرواية</Label>
      <Select :model-value="currentRewaya" @update:model-value="onRewayaChange">
        <SelectTrigger id="currentRewaya" class="w-full">
          <SelectValue placeholder="الرواية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="rewaya in rewayat" :key="rewaya" :value="rewaya">
            {{ rewaya }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="mt-4 grid gap-2">
      <Label for="currentReciter">القارئ الحالي</Label>
      <Select
        :model-value="Number(quranStore.currentReciter)"
        @update:model-value="quranStore.changeReciter(Number($event))"
      >
        <SelectTrigger id="currentReciter" class="w-full">
          <SelectValue placeholder="القارئ الحالي" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="reciter in filteredReciters" :key="reciter.id" :value="reciter.id">
            {{ reciter.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </SettingsSection>
</template>
