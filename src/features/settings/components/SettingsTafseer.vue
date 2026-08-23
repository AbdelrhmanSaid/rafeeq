<script setup>
import tafseers from '@/features/quran/data/tafseers.js'
import { useQuranStore } from '@/features/quran/store.js'
import { IconBook } from '@tabler/icons-vue'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import SettingsSection from './SettingsSection.vue'

const quranStore = useQuranStore()

// Fields read as filled pills rather than outlined boxes. The `data-[size=…]`
// and `dark:` overrides repeat the prefix the vendored trigger uses, so
// tailwind-merge replaces those classes instead of losing a specificity race.
const fieldTriggerClass =
  'h-11 w-full rounded-xl border-0 bg-muted text-base shadow-none data-[size=default]:h-11 dark:bg-muted dark:hover:bg-muted'
</script>

<template>
  <SettingsSection title="التفسير" description="اختر التفسير الافتراضي للآيات" :icon="IconBook">
    <div>
      <Label for="currentTafseer" class="mb-2">التفسير الافتراضي</Label>
      <Select v-model="quranStore.currentTafseer">
        <SelectTrigger id="currentTafseer" :class="fieldTriggerClass">
          <SelectValue placeholder="التفسير الافتراضي" />
        </SelectTrigger>
        <SelectContent class="rounded-2xl border-0 shadow-xl">
          <SelectItem
            v-for="tafseer in tafseers"
            :key="tafseer.identifier"
            :value="tafseer.identifier"
            class="min-h-11 rounded-xl text-base"
          >
            {{ tafseer.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </SettingsSection>
</template>
