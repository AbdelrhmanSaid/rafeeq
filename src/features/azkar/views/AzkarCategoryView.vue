<script setup>
import { computed } from 'vue'
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

const { getCount, setCount, clear } = useAzkarProgress(slug)

// Clamped in case a stored count outlives a change to a zekr's repeat target.
const clampedCount = (index, repeat) => Math.min(getCount(index), repeat || 1)
const totalRepeats = computed(() => category.value?.content?.reduce((sum, z) => sum + (z.repeat || 1), 0) || 0)
const totalClicked = computed(
  () => category.value?.content?.reduce((sum, z, i) => sum + clampedCount(i, z.repeat), 0) || 0,
)
const progress = computed(() => (totalRepeats.value > 0 ? (totalClicked.value / totalRepeats.value) * 100 : 0))

const hasProgress = computed(() => totalClicked.value > 0)

const { isRevealed, reveal, confirm, cancel } = useConfirmDialog()

onBeforeRouteLeave(async () => {
  if (progress.value >= 100) clear()
  if (progress.value <= 0 || progress.value >= 100) return true

  const { isCanceled } = await reveal()
  return !isCanceled
})
</script>

<template>
  <AsyncContent :pending="isFetching" :error="error" loading-message="جاري تحميل الأذكار...">
    <Page v-if="category">
      <div class="d-flex align-items-start justify-content-between gap-2 mb-4">
        <Heading :title="category.meta.name" :subtitle="category.meta.description" :share="true" />

        <button
          v-if="hasProgress"
          class="btn btn-light text-danger flex-shrink-0 d-inline-flex align-items-center gap-1"
          type="button"
          @click="clear"
        >
          <IconRestore size="18" />
          <span>تصفير</span>
        </button>
      </div>

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

      <div class="d-flex justify-content-center">
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
