<script setup>
import tafseers from '@/features/quran/data/tafseers.js'
import { useQuranStore } from '@/features/quran/store.js'
import { IconBook } from '@tabler/icons-vue'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import SettingsSection from './SettingsSection.vue'

const quranStore = useQuranStore()
</script>

<template>
  <SettingsSection title="التفسير" description="اختر التفسير الافتراضي للآيات" :icon="IconBook">
    <div class="grid gap-2">
      <Label for="currentTafseer">التفسير الافتراضي</Label>
      <Select v-model="quranStore.currentTafseer">
        <SelectTrigger id="currentTafseer" class="w-full">
          <SelectValue placeholder="التفسير الافتراضي" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="tafseer in tafseers" :key="tafseer.identifier" :value="tafseer.identifier">
            {{ tafseer.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </SettingsSection>
</template>
