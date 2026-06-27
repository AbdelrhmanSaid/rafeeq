<script setup>
import { computed, ref, watch } from 'vue'
import { useFetch, useOnline } from '@vueuse/core'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'
import { useQuranStore } from '@/features/quran/store'
import tafseers from '@/features/quran/data/tafseers.js'
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-vue'

import BottomSheet from '@/shared/ui/BottomSheet.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'

const props = defineProps({
  ayah: { type: Object, default: null },
  surahName: { type: String, default: '' },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'prev', 'next'])

const online = useOnline()
const quranStore = useQuranStore()

// Keep the last opened ayah so the content stays rendered while the sheet
// animates closed (props.ayah becomes null the moment closing starts).
const displayAyah = ref(props.ayah)

// Seeds from the saved default, but lets the user switch edition just for this
// sheet — picking here never writes back to the stored default.
const edition = ref(quranStore.currentTafseer)

const url = ref('')
const { isFetching, data, error, execute } = useFetch(url, { immediate: false }).json().get()
const tafsir = computed(() => data.value?.data?.[0])

watch([() => props.ayah, edition], ([ayah]) => {
  if (!ayah) return
  displayAyah.value = ayah
  url.value = `${API.quranCloud}/ayah/${ayah.number}/editions/${edition.value}`
  if (online.value) execute()
})
</script>

<template>
  <BottomSheet :show="!!ayah" title="تفسير الآية" @close="emit('close')">
    <div class="p-4">
      <template v-if="displayAyah">
        <p class="fs-3 text-center lh-lg font-quran mb-4">
          {{ displayAyah.text }}
          <span class="ayah-number">{{ toArabicNumerals(displayAyah.numberInSurah) }}</span>
        </p>

        <div class="form-floating mb-4">
          <select class="form-select" id="tafseerEdition" v-model="edition">
            <option v-for="tafseer in tafseers" :key="tafseer.identifier" :value="tafseer.identifier">
              {{ tafseer.name }}
            </option>
          </select>
          <label for="tafseerEdition">التفسير</label>
        </div>
      </template>

      <LoadingState v-if="isFetching" message="جاري تحميل التفسير..." />

      <OfflineState v-else-if="!online && !tafsir" />

      <ErrorState v-else-if="error" :code="500" message="حدث خطأ أثناء تحميل التفسير، برجاء المحاولة مرة أخرى." />

      <template v-else-if="displayAyah && tafsir">
        <p class="mb-0">{{ tafsir.text }}</p>

        <div class="d-flex justify-content-between gap-2 mt-4 pt-3 border-top">
          <button class="btn btn-flat d-flex align-items-center gap-1" :disabled="!hasPrev" @click="emit('prev')">
            <IconChevronRight size="18" />
            <span>الآية السابقة</span>
          </button>

          <button class="btn btn-flat d-flex align-items-center gap-1" :disabled="!hasNext" @click="emit('next')">
            <span>الآية التالية</span>
            <IconChevronLeft size="18" />
          </button>
        </div>
      </template>
    </div>
  </BottomSheet>
</template>

<style lang="scss" scoped>
@import '@/shared/styles/quran.css';
</style>
