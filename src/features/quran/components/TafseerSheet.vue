<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useFetch, useOnline } from '@vueuse/core'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'
import { useQuranStore } from '@/features/quran/store'
import tafseers from '@/features/quran/data/tafseers.js'
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-vue'

import BottomSheet from '@/shared/ui/BottomSheet.vue'
import SelectRow from '@/shared/ui/SelectRow.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'

const props = defineProps({
  ayah: { type: Object, default: null },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'prev', 'next'])

const tafseerOptions = tafseers.map((tafseer) => ({ value: tafseer.identifier, label: tafseer.name }))

const online = useOnline()
const quranStore = useQuranStore()

// Kept through the close animation.
const displayAyah = ref(props.ayah)

// Edition changes here are temporary and do not replace the saved default.
const edition = ref(quranStore.currentTafseer)

const url = ref('')
const { isFetching, data, error, execute } = useFetch(url, { immediate: false }).json().get()
const tafsir = computed(() => data.value?.data?.[0])

const scroller = useTemplateRef('scroller')

watch([() => props.ayah, edition], ([ayah], [previous]) => {
  if (!ayah) return
  displayAyah.value = ayah
  if (!previous) data.value = null
  if (ayah !== previous) scroller.value?.scrollTo?.({ top: 0 })
  url.value = `${API.quranCloud}/ayah/${ayah.number}/editions/${edition.value}`
  if (online.value) execute()
  // Offline nothing is fetched, so the previous ayah's tafsir mustn't stay.
  else data.value = null
})

watch(online, (isOnline) => {
  if (isOnline && props.ayah && !data.value && !isFetching.value) execute()
})
</script>

<template>
  <BottomSheet :show="!!ayah" title="تفسير الآية" @close="emit('close')">
    <div class="tafseer">
      <div ref="scroller" class="tafseer__scroll p-4" :aria-busy="isFetching">
        <template v-if="displayAyah">
          <p class="fs-3 text-center lh-lg font-quran mb-4">
            {{ displayAyah.text }}
            <span class="ayah-number">{{ toArabicNumerals(displayAyah.numberInSurah) }}</span>
          </p>

          <div class="row-group mb-4">
            <SelectRow v-model="edition" label="التفسير" :options="tafseerOptions" />
          </div>
        </template>

        <OfflineState v-if="!online && !tafsir" />

        <ErrorState
          v-else-if="error && !isFetching"
          message="حدث خطأ أثناء تحميل التفسير، برجاء المحاولة مرة أخرى."
          :retry="execute"
        />

        <p v-else-if="tafsir" class="tafseer__text mb-0" :class="{ 'is-stale': isFetching }">{{ tafsir.text }}</p>

        <LoadingState v-else message="جاري تحميل التفسير..." />
      </div>

      <div v-if="displayAyah" class="tafseer__nav">
        <button class="btn btn-flat d-flex align-items-center gap-1" :disabled="!hasPrev" @click="emit('prev')">
          <IconChevronRight size="18" />
          <span>الآية السابقة</span>
        </button>

        <button class="btn btn-flat d-flex align-items-center gap-1" :disabled="!hasNext" @click="emit('next')">
          <span>الآية التالية</span>
          <IconChevronLeft size="18" />
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<style lang="scss" scoped>
@import '@/features/quran/styles/ayah-number.css';

.tafseer {
  display: flex;
  flex-direction: column;
  height: min(70dvh, 34rem);
}

.tafseer__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.tafseer__text {
  transition: opacity 0.2s ease;

  &.is-stale {
    opacity: 0.4;
  }
}

.tafseer__nav {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem 0;
  border-top: 1px solid var(--app-hairline);
}
</style>
