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

function onLayoutChange(value) {
  if (value) store.layout = value
}

const AUTO_OPTION_VALUE = '__auto__'
const toOptionValue = (value) => (value === AUTO ? AUTO_OPTION_VALUE : value)
const fromOptionValue = (value) => (value === AUTO_OPTION_VALUE ? AUTO : value)

const fieldTriggerClass =
  'h-11 w-full rounded-xl border-0 bg-muted text-base shadow-none data-[size=default]:h-11 dark:bg-muted dark:hover:bg-muted'

const segmentClass =
  'min-h-11 rounded-full px-2 text-sm font-medium text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:shadow-sm'
</script>
<template>
  <SettingsSection
    title="مواقيت الصلاة"
    description="حدّد موقعك وطريقة عرض المواقيت"
    :icon="IconClockHour4"
    body-class="divide-y py-0"
  >
    <div class="py-3">
      <span class="mb-2 block text-sm font-medium">طريقة العرض</span>
      <ToggleGroup
        type="single"
        :spacing="1"
        class="grid w-full grid-cols-3 gap-1 rounded-full bg-muted p-1"
        :model-value="store.layout"
        @update:model-value="onLayoutChange"
      >
        <ToggleGroupItem value="cards" :class="segmentClass">
          <IconLayoutGrid class="size-4" />
          <span>بطاقات</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="list" :class="segmentClass">
          <IconLayoutList class="size-4" />
          <span>قائمة</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="auto" :class="segmentClass">
          <IconDevices class="size-4" />
          <span>تلقائي</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div class="py-3">
      <Label for="location" class="mb-2">الموقع</Label>
      <div class="flex items-center gap-2">
        <Input
          id="location"
          type="text"
          :model-value="location"
          readonly
          class="h-11 min-w-0 flex-1 rounded-full border-0 bg-muted px-4 text-base shadow-none dark:bg-muted"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="size-11 shrink-0 rounded-full border-0 bg-muted shadow-none hover:bg-accent active:scale-95 dark:bg-muted dark:hover:bg-accent"
          aria-label="تحديد الموقع"
          @click="detect"
        >
          <IconRefreshDot class="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="size-11 shrink-0 rounded-full border-0 bg-muted text-destructive shadow-none hover:bg-destructive hover:text-destructive-foreground active:scale-95 dark:bg-muted"
          aria-label="حذف الموقع"
          @click="store.clear"
        >
          <IconTrash class="size-5" />
        </Button>
      </div>
    </div>
    <div v-for="field in calculationFields" :key="field.key" class="py-3">
      <Label :for="field.key" class="mb-2">{{ field.label }}</Label>
      <Select
        :model-value="toOptionValue(store[field.key])"
        @update:model-value="store[field.key] = fromOptionValue($event)"
      >
        <SelectTrigger :id="field.key" :class="fieldTriggerClass">
          <SelectValue :placeholder="field.label" />
        </SelectTrigger>
        <SelectContent class="rounded-2xl border-0 shadow-xl">
          <SelectItem
            v-for="option in field.options"
            :key="option.value"
            :value="toOptionValue(option.value)"
            class="min-h-11 rounded-xl text-base"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </SettingsSection>
</template>
