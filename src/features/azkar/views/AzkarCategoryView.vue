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

const sheetRowClass =
  'flex w-full min-h-14 items-center gap-3 rounded-2xl px-3 text-start transition-colors hover:bg-accent/60 active:bg-accent'
</script>
<template>
  <AsyncContent :pending="isFetching" :error="error" loading-message="جاري تحميل الأذكار...">
    <Page v-if="category">
      <Heading class="mb-4" :title="category.meta.name" :subtitle="category.meta.description" :share="true" />
      <div class="space-y-4">
        <ZekrCard
          v-for="(zekr, index) in category.content"
          :key="index"
          v-model:count="counts[index]"
          :text="zekr.text"
          :repeat="zekr.repeat"
          :reference="zekr.reference"
          :benefit="zekr.benefit"
        />
      </div>
      <div class="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          v-if="totalClicked > 0"
          variant="ghost"
          type="button"
          class="h-11 gap-1.5 rounded-full px-5 text-muted-foreground active:scale-95"
          @click="resetProgress"
        >
          <IconRestore class="size-5" />
          <span>تصفير</span>
        </Button>
        <BackButton
          :to="{ name: 'azkar' }"
          button-class="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        />
      </div>
    </Page>
  </AsyncContent>
  <!-- Leave confirmation sheet -->
  <BottomSheet :show="isRevealed" title="لم تنتهِ بعد" @close="cancel">
    <p class="px-4 pb-4 leading-relaxed text-muted-foreground">لم تنتهِ من جميع الأذكار بعد، هل تريد المغادرة؟</p>
    <ul class="space-y-1 px-2 pb-2">
      <li>
        <button type="button" :class="sheetRowClass" @click="cancel">
          <span class="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <IconArrowBackUp class="size-5" />
          </span>
          <span class="min-w-0 flex-1 font-medium">البقاء ومتابعة الأذكار</span>
        </button>
      </li>
      <li>
        <button type="button" :class="[sheetRowClass, 'text-destructive']" @click="confirm">
          <span class="grid size-11 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
            <IconDoorExit class="size-5" />
          </span>
          <span class="min-w-0 flex-1 font-medium">مغادرة</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>
