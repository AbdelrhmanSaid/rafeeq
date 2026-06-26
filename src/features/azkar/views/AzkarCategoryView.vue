<script setup>
import { computed, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useConfirmDialog } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { IconDoorExit, IconArrowBackUp, IconRestore } from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import AsyncContent from '@/shared/ui/AsyncContent.vue'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import ZekrCard from '@/features/azkar/components/ZekrCard.vue'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { useAzkarProgress } from '@/features/azkar/composables/useAzkarProgress'
import { fetchCategory } from '@/features/azkar/api'

const slug = useRouteParams('category')

const { data: category, error, pending: isFetching } = useAsyncData(() => fetchCategory(slug.value))

usePageMeta(
  () =>
    category.value && {
      title: category.value.meta.name,
      description: category.value.meta.description,
      keywords: ['أذكار', 'دعاء', category.value.meta.name, 'رفيق'],
    },
)

// Per-zekr counts persisted in localStorage so progress survives reloads and
// navigating away, letting the user resume the category where they stopped.
const { getCount, setCount, clear } = useAzkarProgress(slug)

// Track progress across all azkar (clamped in case a stored count outlives a
// change to a zekr's repeat target).
const clampedCount = (index, repeat) => Math.min(getCount(index), repeat || 1)
const totalRepeats = computed(() => category.value?.content?.reduce((sum, z) => sum + (z.repeat || 1), 0) || 0)
const totalClicked = computed(
  () => category.value?.content?.reduce((sum, z, i) => sum + clampedCount(i, z.repeat), 0) || 0,
)
const progress = computed(() => (totalRepeats.value > 0 ? (totalClicked.value / totalRepeats.value) * 100 : 0))

const hasProgress = computed(() => totalClicked.value > 0)
const isComplete = () => progress.value >= 100
const hasUnfinishedProgress = () => progress.value > 0 && !isComplete()

// Manual reset of the current category's progress
const isResetRevealed = ref(false)

const resetProgress = () => {
  clear()
  isResetRevealed.value = false
}

// Confirm dialog before leaving
const { isRevealed, reveal, confirm, cancel } = useConfirmDialog()

onBeforeRouteLeave(async () => {
  // Clear a finished category so the next visit starts fresh.
  if (isComplete()) {
    clear()
    return true
  }

  if (!hasUnfinishedProgress()) return true

  const { isCanceled } = await reveal()
  return !isCanceled
})
</script>

<template>
  <AsyncContent :pending="isFetching" :error="error" loading-message="جاري تحميل الأذكار...">
    <Page v-if="category">
      <Heading class="mb-4" :title="category.meta.name" :subtitle="category.meta.description" :share="true" />

      <ZekrCard
        class="mb-3"
        v-for="(zekr, index) in category.content"
        :key="index"
        :text="zekr.text"
        :repeat="zekr.repeat"
        :reference="zekr.reference"
        :benefit="zekr.benefit"
        :count="clampedCount(index, zekr.repeat)"
        @update:count="setCount(index, $event)"
      />

      <div class="d-flex justify-content-center gap-2">
        <BackButton :to="{ name: 'azkar' }" button-class="btn-primary" />
        <button v-if="hasProgress" class="btn btn-outline-secondary" type="button" @click="isResetRevealed = true">
          <IconRestore size="18" class="me-1" />
          <span>تصفير التقدم</span>
        </button>
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

  <!-- Reset confirmation sheet -->
  <BottomSheet :show="isResetRevealed" title="تصفير التقدم" @close="isResetRevealed = false">
    <p class="px-4 pt-3 mb-2 lh-lg text-secondary">سيتم تصفير تقدمك في هذه الأذكار، هل أنت متأكد؟</p>
    <ul class="list-unstyled m-0 py-2">
      <li>
        <button class="bottom-sheet-item" @click="isResetRevealed = false">
          <IconArrowBackUp size="20" />
          <span>تراجع</span>
        </button>
      </li>
      <li>
        <button class="bottom-sheet-item text-danger" @click="resetProgress">
          <IconRestore size="20" />
          <span>تصفير</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>
