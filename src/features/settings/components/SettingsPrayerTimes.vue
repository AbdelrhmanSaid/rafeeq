<script setup>
import { computed } from 'vue'
import { usePrayersStore } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/composables/usePrayerLocation'
import { IconRefreshDot, IconTrash } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'
import SelectRow from '@/shared/ui/SelectRow.vue'
import { CALCULATION_FIELDS } from '@/features/prayers/constants/calculationOptions'

const store = usePrayersStore()

const { detect } = usePrayerLocation()

const isCoordinate = (value) => Number.isFinite(Number(value)) && Number(value) !== 0

// Four decimals, about 10 m.
const location = computed(() => {
  if (!isCoordinate(store.latitude) || !isCoordinate(store.longitude)) return null
  return [store.latitude, store.longitude].map((value) => Number(value).toFixed(4)).join(', ')
})
</script>

<template>
  <SettingsSection title="مواقيت الصلاة" description="حدّد موقعك وطريقة حساب المواقيت">
    <div class="row-group row-group--flush">
      <div class="location-row">
        <span>الموقع</span>
        <bdi v-if="location" class="location-row__value" dir="ltr">{{ location }}</bdi>
        <span v-else class="location-row__value">لم يتم تحديد الموقع</span>
        <button type="button" class="location-row__action" aria-label="تحديد الموقع" @click="detect">
          <IconRefreshDot size="1.25rem" />
        </button>
        <button type="button" class="location-row__action" aria-label="مسح الموقع" @click="store.clear">
          <IconTrash size="1.25rem" />
        </button>
      </div>

      <SelectRow
        v-for="field in CALCULATION_FIELDS"
        :key="field.key"
        v-model="store[field.key]"
        :label="field.label"
        :options="field.options"
      />
    </div>
  </SettingsSection>
</template>

<style scoped>
.location-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 3rem;
}

/* Wraps rather than cutting off: at a large text size the two coordinates sit one above the other. */
.location-row__value {
  flex: 1;
  min-width: 0;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
  line-height: 1.35;
  text-align: end;
}

/* A thumb-sized target that stops growing past 44px at a large text size, leaving the coordinates room. */
.location-row__action {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: min(2.75rem, 44px);
  height: min(2.75rem, 44px);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--bs-secondary-color);
}
</style>
