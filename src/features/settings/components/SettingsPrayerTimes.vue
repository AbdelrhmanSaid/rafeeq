<script setup>
import { computed } from 'vue'
import { usePrayersStore } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/composables/usePrayerLocation'
import {
  IconRefreshDot,
  IconTrash,
  IconLayoutList,
  IconLayoutGrid,
  IconDevices,
  IconClockHour4,
} from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import SettingsSection from './SettingsSection.vue'
import { AUTO, CALCULATION_FIELDS } from '@/features/prayers/constants/calculationOptions'

const store = usePrayersStore()

const calculationFields = CALCULATION_FIELDS
const { detect } = usePrayerLocation()

const location = computed(() => {
  if (store.latitude === 0 || store.longitude === 0) {
    return 'لم يتم تحديد الموقع'
  }

  return `${store.latitude}, ${store.longitude}`
})

// A single-select <ToggleGroup> clears its value when the active item is pressed
// again; the layout setting has no "unset" state, so ignore the empty update
// instead of writing an unknown layout to the store.
function onLayoutChange(value) {
  if (value) store.layout = value
}

// reka-ui's <SelectItem> throws on an empty-string value because '' is reserved
// for "cleared, show the placeholder", but AUTO is '' in the stored settings —
// so swap it for a sentinel going into the Select and back to AUTO coming out.
const AUTO_OPTION_VALUE = '__auto__'
const toOptionValue = (value) => (value === AUTO ? AUTO_OPTION_VALUE : value)
const fromOptionValue = (value) => (value === AUTO_OPTION_VALUE ? AUTO : value)
</script>

<template>
  <SettingsSection title="مواقيت الصلاة" description="حدّد موقعك وطريقة عرض المواقيت" :icon="IconClockHour4">
    <div class="mb-4 grid gap-2">
      <span class="text-sm font-medium">طريقة العرض</span>
      <ToggleGroup
        type="single"
        variant="outline"
        :spacing="2"
        class="grid w-full grid-cols-3"
        :model-value="store.layout"
        @update:model-value="onLayoutChange"
      >
        <ToggleGroupItem value="cards">
          <IconLayoutGrid :size="16" />
          <span>بطاقات</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="list">
          <IconLayoutList :size="16" />
          <span>قائمة</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="auto">
          <IconDevices :size="16" />
          <span>تلقائي</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div class="mb-4 grid gap-2">
      <Label for="location">الموقع</Label>
      <div class="flex items-center gap-2">
        <Input id="location" type="text" :model-value="location" readonly class="flex-1" />

        <Button type="button" variant="outline" size="icon" aria-label="تحديد الموقع" @click="detect">
          <IconRefreshDot size="1.25rem" />
        </Button>

        <Button type="button" variant="outline" size="icon" aria-label="حذف الموقع" @click="store.clear">
          <IconTrash size="1.25rem" />
        </Button>
      </div>
    </div>

    <div v-for="field in calculationFields" :key="field.key" class="mb-4 grid gap-2 last:mb-0">
      <Label :for="field.key">{{ field.label }}</Label>
      <Select
        :model-value="toOptionValue(store[field.key])"
        @update:model-value="store[field.key] = fromOptionValue($event)"
      >
        <SelectTrigger :id="field.key" class="w-full">
          <SelectValue :placeholder="field.label" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in field.options" :key="option.value" :value="toOptionValue(option.value)">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </SettingsSection>
</template>
