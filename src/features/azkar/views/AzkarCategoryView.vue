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
import { Button } from '@/shared/components/ui/button'
import ZekrCard from '@/features/azkar/components/ZekrCard.vue'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { useAzkarProgress } from '@/features/azkar/composables/useAzkarProgress'
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
        class="mb-3"
        v-for="(zekr, index) in category.content"
        :key="index"
        v-model:count="counts[index]"
        :text="zekr.text"
        :repeat="zekr.repeat"
        :reference="zekr.reference"
        :benefit="zekr.benefit"
      />

      <div class="flex justify-center gap-2">
        <Button v-if="totalClicked > 0" variant="ghost" type="button" @click="resetProgress">
          <IconRestore class="size-5" />
          <span>تصفير</span>
        </Button>

        <BackButton :to="{ name: 'azkar' }" button-class="bg-primary text-primary-foreground hover:bg-primary/90" />
      </div>
    </Page>
  </AsyncContent>

  <!-- Leave confirmation sheet -->
  <BottomSheet :show="isRevealed" title="لم تنتهِ بعد" @close="cancel">
    <p class="mb-2 px-4 pt-3 leading-relaxed text-muted-foreground">لم تنتهِ من جميع الأذكار بعد، هل تريد المغادرة؟</p>
    <ul class="py-2">
      <li>
        <button
          type="button"
          class="flex w-full items-center gap-3 px-5 py-3 text-start transition-colors hover:bg-secondary"
          @click="cancel"
        >
          <IconArrowBackUp class="size-5" />
          <span>البقاء ومتابعة الأذكار</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          class="flex w-full items-center gap-3 px-5 py-3 text-start text-destructive transition-colors hover:bg-secondary"
          @click="confirm"
        >
          <IconDoorExit class="size-5" />
          <span>مغادرة</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>
