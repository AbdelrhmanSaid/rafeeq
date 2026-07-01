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
import SettingsSection from './SettingsSection.vue'
import { CALCULATION_FIELDS } from '@/features/prayers/constants/calculationOptions'

const store = usePrayersStore()

const calculationFields = CALCULATION_FIELDS
const { detect } = usePrayerLocation()

const location = computed(() => {
  if (store.latitude === 0 || store.longitude === 0) {
    return 'لم يتم تحديد الموقع'
  }

  return `${store.latitude}, ${store.longitude}`
})
</script>

<template>
  <SettingsSection title="مواقيت الصلاة" description="حدّد موقعك وطريقة عرض المواقيت" :icon="IconClockHour4">
    <div class="mb-3">
      <div class="input-group">
        <div class="form-floating">
          <input id="location" type="text" class="form-control" :value="location" readonly />
          <label for="location">الموقع</label>
        </div>

        <button type="button" class="input-group-text" @click="detect">
          <IconRefreshDot size="1.25rem" />
        </button>

        <button type="button" class="input-group-text" @click="store.clear">
          <IconTrash size="1.25rem" />
        </button>
      </div>
    </div>

    <div class="mb-3">
      <span class="d-block mb-2">طريقة العرض</span>
      <div class="btn-group-toggle">
        <button class="btn-toggle" :class="{ active: store.layout === 'cards' }" @click="store.layout = 'cards'">
          <IconLayoutGrid :size="16" />
          <span>بطاقات</span>
        </button>
        <button class="btn-toggle" :class="{ active: store.layout === 'list' }" @click="store.layout = 'list'">
          <IconLayoutList :size="16" />
          <span>قائمة</span>
        </button>
        <button class="btn-toggle" :class="{ active: store.layout === 'auto' }" @click="store.layout = 'auto'">
          <IconDevices :size="16" />
          <span>تلقائي</span>
        </button>
      </div>
    </div>

    <div v-for="field in calculationFields" :key="field.key" class="mb-3">
      <div class="form-floating">
        <select :id="field.key" class="form-select" v-model="store[field.key]">
          <option v-for="option in field.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <label :for="field.key">{{ field.label }}</label>
      </div>
    </div>
  </SettingsSection>
</template>
