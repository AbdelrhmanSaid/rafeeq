<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useConfirmDialog, useOnline } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { IconDoorExit, IconArrowBackUp, IconRestore, IconBookOff } from '@tabler/icons-vue'

import { useAppStore } from '@/app/stores/app'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import AsyncContent from '@/shared/ui/AsyncContent.vue'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import StatePanel from '@/shared/ui/StatePanel.vue'
import ZekrCard from '@/features/azkar/components/ZekrCard.vue'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
import { useAzkarProgress } from '@/features/azkar/composables/useAzkarProgress'
import { useScreenWakeLock } from '@/shared/composables/useScreenWakeLock'
import { useReconnectExecute } from '@/shared/composables/useReconnectExecute'
import { fetchCategory } from '@/features/azkar/api'

const router = useRouter()
const { zekrSaveProgress, zekrConfirmOnLeave } = storeToRefs(useAppStore())

const slug = useRouteParams('category')
const { counts, reset: resetProgress } = useAzkarProgress(slug, zekrSaveProgress.value)

const {
  data: category,
  error,
  pending: isFetching,
  execute: reloadCategory,
} = useAsyncData(() => fetchCategory(slug.value))

// A category opened offline failed to load; fetch it again once the connection is back. A loaded one stays as it is.
useReconnectExecute(useOnline(), () => error.value && reloadCategory())

usePageMeta(() => {
  if (category.value) {
    return {
      title: category.value.meta.name,
      description: category.value.meta.description,
      keywords: ['أذكار', 'دعاء', category.value.meta.name, 'رفيق'],
    }
  }
  // Loaded, but there is no such category.
  if (!isFetching.value && !error.value) return { title: 'الباب غير موجود' }
})

const totalRepeats = computed(() => category.value?.content?.reduce((sum, z) => sum + (z.repeat || 1), 0) || 0)
const totalClicked = computed(
  () => category.value?.content?.reduce((sum, _, index) => sum + (counts.value[index] || 0), 0) || 0,
)
const progress = computed(() => (totalRepeats.value > 0 ? (totalClicked.value / totalRepeats.value) * 100 : 0))

const hasUnfinishedProgress = () => progress.value > 0 && progress.value < 100

useScreenWakeLock()

const { isRevealed, reveal, confirm, cancel } = useConfirmDialog()

onBeforeRouteLeave(async () => {
  if (!zekrConfirmOnLeave.value || !hasUnfinishedProgress()) return true

  const { isCanceled } = await reveal()
  return !isCanceled
})
</script>

<template>
  <AsyncContent :pending="isFetching" :error="error" :retry="reloadCategory" loading-message="جاري تحميل الأذكار...">
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

      <!-- Back lives in the app bar; the page ends with a quiet reset once counting has started. -->
      <div v-if="totalClicked > 0" class="d-flex justify-content-center">
        <button type="button" class="btn btn-flat d-inline-flex align-items-center gap-2" @click="resetProgress">
          <IconRestore size="1.25rem" />
          <span>تصفير الكل</span>
        </button>
      </div>
    </Page>

    <!-- An unknown category resolves to nothing rather than failing, so it gets its own state, not a retry. -->
    <Page v-else class="full-height missing-category">
      <StatePanel :icon="IconBookOff" title="الباب غير موجود" message="لم نعثر على هذا الباب من الأذكار.">
        <button type="button" class="btn btn-soft" @click="router.push({ name: 'azkar' })">كل الأذكار</button>
      </StatePanel>
    </Page>
  </AsyncContent>

  <BottomSheet :show="isRevealed" title="لم تنتهِ بعد" :close-on-back="false" @close="cancel">
    <p class="px-4 pt-1 mb-2 lh-lg text-secondary">لم تنتهِ من جميع الأذكار بعد، هل تريد المغادرة؟</p>
    <ul class="bottom-sheet-list">
      <li>
        <button type="button" class="bottom-sheet-item" @click="cancel">
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
.missing-category {
  display: grid;
  place-items: center;
}

/* Skip rendering off-screen cards in long categories. */
.zekr-card-lazy {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}

/* Lift open menus out of content-visibility's paint containment. */
.zekr-card-lazy:has(.dropdown-menu.show) {
  content-visibility: visible;
}
</style>
