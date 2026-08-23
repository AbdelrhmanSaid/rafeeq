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

// Fields read as filled pills rather than outlined boxes. The `data-[size=…]`
// and `dark:` overrides repeat the prefix the vendored trigger uses, so
// tailwind-merge replaces those classes instead of losing a specificity race.
const fieldTriggerClass =
  'h-11 w-full rounded-xl border-0 bg-muted text-base shadow-none data-[size=default]:h-11 dark:bg-muted dark:hover:bg-muted'
</script>

<template>
  <SettingsSection
    title="القرآن الكريم"
    description="اختر الرواية والقارئ المفضل لديك"
    :icon="IconMicrophone2"
    body-class="divide-y p-0"
  >
    <div class="px-4 py-3">
      <Label for="currentRewaya" class="mb-2">الرواية</Label>
      <Select :model-value="currentRewaya" @update:model-value="onRewayaChange">
        <SelectTrigger id="currentRewaya" :class="fieldTriggerClass">
          <SelectValue placeholder="الرواية" />
        </SelectTrigger>
        <SelectContent class="rounded-2xl border-0 shadow-xl">
          <SelectItem v-for="rewaya in rewayat" :key="rewaya" :value="rewaya" class="min-h-11 rounded-xl text-base">
            {{ rewaya }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="px-4 py-3">
      <Label for="currentReciter" class="mb-2">القارئ الحالي</Label>
      <Select
        :model-value="Number(quranStore.currentReciter)"
        @update:model-value="quranStore.changeReciter(Number($event))"
      >
        <SelectTrigger id="currentReciter" :class="fieldTriggerClass">
          <SelectValue placeholder="القارئ الحالي" />
        </SelectTrigger>
        <SelectContent class="rounded-2xl border-0 shadow-xl">
          <SelectItem
            v-for="reciter in filteredReciters"
            :key="reciter.id"
            :value="reciter.id"
            class="min-h-11 rounded-xl text-base"
          >
            {{ reciter.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </SettingsSection>
</template>
