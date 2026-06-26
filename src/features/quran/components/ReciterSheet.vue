<script setup>
import { useReciterSelection } from '@/features/quran/composables/useReciterSelection.js'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const { rewayat, currentRewaya, filteredReciters, currentReciterId, selectRewaya, selectReciter } =
  useReciterSelection()
</script>

<template>
  <BottomSheet :show="show" title="اختيار القارئ" @close="emit('close')">
    <div class="p-4">
      <div class="mb-3">
        <span class="d-block mb-2">الرواية</span>
        <div class="form-floating">
          <select
            class="form-select"
            id="sheetRewaya"
            :value="currentRewaya"
            @change="selectRewaya($event.target.value)"
          >
            <option v-for="rewaya in rewayat" :key="rewaya" :value="rewaya">
              {{ rewaya }}
            </option>
          </select>
          <label for="sheetRewaya">الرواية</label>
        </div>
      </div>

      <div>
        <span class="d-block mb-2">القارئ</span>
        <div class="form-floating">
          <select
            class="form-select"
            id="sheetReciter"
            :value="currentReciterId"
            @change="selectReciter($event.target.value)"
          >
            <option v-for="reciter in filteredReciters" :key="reciter.id" :value="reciter.id">
              {{ reciter.name }}
            </option>
          </select>
          <label for="sheetReciter">القارئ الحالي</label>
        </div>
      </div>
    </div>
  </BottomSheet>
</template>
