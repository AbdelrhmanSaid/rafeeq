<script setup>
import { computed, ref, watch } from 'vue'
import { useFetch, useOnline } from '@vueuse/core'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'

import BottomSheet from '@/shared/ui/BottomSheet.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'

const props = defineProps({
  ayah: { type: Object, default: null },
  surahName: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const online = useOnline()

// Keep the last opened ayah so the content stays rendered while the sheet
// animates closed (props.ayah becomes null the moment closing starts).
const displayAyah = ref(props.ayah)

const url = ref('')
const { isFetching, data, error, execute } = useFetch(url, { immediate: false }).json().get()
const tafsir = computed(() => data.value?.data?.[0])

watch(
  () => props.ayah,
  (ayah) => {
    if (!ayah) return
    displayAyah.value = ayah
    url.value = `${API.quranCloud}/ayah/${ayah.number}/editions/ar.muyassar`
    if (online.value) execute()
  },
)
</script>

<template>
  <BottomSheet :show="!!ayah" title="تفسير الآية" @close="emit('close')">
    <div class="p-4">
      <LoadingState v-if="isFetching" message="جاري تحميل التفسير..." />

      <OfflineState v-else-if="!online && !tafsir" />

      <ErrorState v-else-if="error" :code="500" message="حدث خطأ أثناء تحميل التفسير، برجاء المحاولة مرة أخرى." />

      <template v-else-if="displayAyah && tafsir">
        <p class="fs-3 text-center lh-lg font-quran mb-4">
          {{ displayAyah.text }}
          <span class="ayah-number">{{ toArabicNumerals(displayAyah.numberInSurah) }}</span>
        </p>

        <span class="d-block small fw-semibold text-secondary mb-2">{{ tafsir.edition.name }}</span>
        <p class="mb-0">{{ tafsir.text }}</p>
      </template>
    </div>
  </BottomSheet>
</template>

<style lang="scss" scoped>
@import '@/shared/styles/quran.css';
</style>
