<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave } from 'vue-router'
import { useConfirmDialog } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { IconDoorExit, IconArrowBackUp, IconRestore } from '@tabler/icons-vue'

import { useAppStore } from '@/app/stores/app'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import AsyncContent from '@/shared/ui/AsyncContent.vue'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import ZekrCard from '@/features/azkar/components/ZekrCard.vue'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { useAzkarProgress } from '@/features/azkar/composables/useAzkarProgress'
import { useScreenWakeLock } from '@/shared/composables/useScreenWakeLock'
import { fetchCategory } from '@/features/azkar/api'

const { zekrSaveProgress, zekrConfirmOnLeave } = storeToRefs(useAppStore())

const slug = useRouteParams('category')
const { counts, reset: resetProgress } = useAzkarProgress(slug, zekrSaveProgress.value)

const { data: category, error, pending: isFetching } = useAsyncData(() => fetchCategory(slug.value))

usePageMeta(
  () =>
    category.value && {
      title: category.value.meta.name,
      description: category.value.meta.description,
      keywords: ['أذكار', 'دعاء', category.value.meta.name, 'رفيق'],
    },
)

// Track progress across all azkar, derived from the persisted per-zekr counts.
const totalRepeats = computed(() => category.value?.content?.reduce((sum, z) => sum + (z.repeat || 1), 0) || 0)
const totalClicked = computed(
  () => category.value?.content?.reduce((sum, _, index) => sum + (counts.value[index] || 0), 0) || 0,
)
const progress = computed(() => (totalRepeats.value > 0 ? (totalClicked.value / totalRepeats.value) * 100 : 0))

const hasUnfinishedProgress = () => progress.value > 0 && progress.value < 100

useScreenWakeLock()

// Confirm dialog before leaving
const { isRevealed, reveal, confirm, cancel } = useConfirmDialog()

onBeforeRouteLeave(async () => {
  if (!zekrConfirmOnLeave.value || !hasUnfinishedProgress()) return true

  const { isCanceled } = await reveal()
  return !isCanceled
})
</script>

<template>
  <AsyncContent :pending="isFetching" :error="error" loading-message="جاري تحميل الأذكار...">
    <Page v-if="category">
      <Heading class="mb-4" :title="category.meta.name" :subtitle="category.meta.description" :share="true" />

      <ZekrCard
        class="mb-3 zekr-card-lazy"
        v-for="(zekr, index) in category.content"
        :key="index"
        v-model:count="counts[index]"
        :text="zekr.text"
        :repeat="zekr.repeat"
        :reference="zekr.reference"
        :benefit="zekr.benefit"
      />

      <div class="d-flex justify-content-center gap-2">
        <button
          v-if="totalClicked > 0"
          type="button"
          class="btn btn-flat d-inline-flex align-items-center gap-2"
          @click="resetProgress"
        >
          <IconRestore size="1.25rem" />
          <span>تصفير</span>
        </button>

        <BackButton :to="{ name: 'azkar' }" button-class="btn-primary" />
      </div>
    </Page>
  </AsyncContent>

  <!-- Leave confirmation sheet -->
  <BottomSheet :show="isRevealed" title="لم تنتهِ بعد" @close="cancel">
    <p class="px-4 pt-3 mb-2 lh-lg text-secondary">لم تنتهِ من جميع الأذكار بعد، هل تريد المغادرة؟</p>
    <ul class="list-unstyled m-0 py-2">
      <li>
        <button class="bottom-sheet-item" @click="cancel">
          <IconArrowBackUp size="20" />
          <span>البقاء ومتابعة الأذكار</span>
        </button>
      </li>
      <li>
        <button class="bottom-sheet-item text-danger" @click="confirm">
          <IconDoorExit size="20" />
          <span>مغادرة</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>

<style scoped>
/* Long categories (morning/evening azkar) render dozens of heavy Arabic-text
   cards — let the browser skip layout and paint for the off-screen ones. */
.zekr-card-lazy {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}

/* content-visibility implies paint containment, which clips the card's action
   dropdown at the card edge (and traps its z-index under the next card). Lift
   it only while a dropdown is open so the lazy rendering stays for the rest. */
.zekr-card-lazy:has(.dropdown-menu.show) {
  content-visibility: visible;
}
</style>
