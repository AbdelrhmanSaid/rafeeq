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
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

const props = defineProps({
  ayah: { type: Object, default: null },
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
        <p class="mb-4 text-center text-3xl leading-loose font-quran">
          {{ displayAyah.text }}
          <span class="ayah-number">{{ toArabicNumerals(displayAyah.numberInSurah) }}</span>
        </p>

        <div class="mb-4 grid gap-2">
          <Label for="tafseerEdition">التفسير</Label>
          <Select v-model="edition">
            <SelectTrigger id="tafseerEdition" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="tafseer in tafseers" :key="tafseer.identifier" :value="tafseer.identifier">
                {{ tafseer.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </template>

      <LoadingState v-if="isFetching" message="جاري تحميل التفسير..." />

      <OfflineState v-else-if="!online && !tafsir" />

      <ErrorState v-else-if="error" :code="500" message="حدث خطأ أثناء تحميل التفسير، برجاء المحاولة مرة أخرى." />

      <template v-else-if="displayAyah && tafsir">
        <p>{{ tafsir.text }}</p>

        <div class="mt-4 flex justify-between gap-2 border-t pt-3">
          <Button variant="ghost" :disabled="!hasPrev" @click="emit('prev')">
            <IconChevronRight size="18" />
            <span>الآية السابقة</span>
          </Button>

          <Button variant="ghost" :disabled="!hasNext" @click="emit('next')">
            <span>الآية التالية</span>
            <IconChevronLeft size="18" />
          </Button>
        </div>
      </template>
    </div>
  </BottomSheet>
</template>

<style scoped>
@import '@/shared/styles/quran.css';
</style>
