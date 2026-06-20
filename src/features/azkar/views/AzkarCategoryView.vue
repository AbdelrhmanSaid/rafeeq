<script setup>
import { ref, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useConfirmDialog } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import AsyncContent from '@/shared/ui/AsyncContent.vue'
import ZekrCard from '@/features/azkar/components/ZekrCard.vue'
import { useAsyncData } from '@/shared/composables/useAsyncData'
import { usePageMeta } from '@/shared/composables/usePageMeta'
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

// Track progress across all azkar
const totalClicked = ref(0)
const totalRepeats = computed(() => category.value?.content?.reduce((sum, z) => sum + (z.repeat || 1), 0) || 0)
const progress = computed(() => (totalRepeats.value > 0 ? (totalClicked.value / totalRepeats.value) * 100 : 0))

const hasUnfinishedProgress = () => progress.value > 0 && progress.value < 100

// Confirm dialog before leaving
const { isRevealed, reveal, confirm, cancel } = useConfirmDialog()

onBeforeRouteLeave(async () => {
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
        @increment="totalClicked++"
        @reset="totalClicked -= $event"
      />

      <div class="d-flex justify-content-center">
        <BackButton :to="{ name: 'azkar' }" button-class="btn-primary" />
      </div>
    </Page>
  </AsyncContent>

  <!-- Leave confirmation dialog -->
  <Teleport to="body">
    <div v-if="isRevealed" class="modal-backdrop show"></div>
    <div v-if="isRevealed" class="modal d-block" tabindex="-1" @click.self="cancel">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content text-center">
          <div class="modal-body p-4">
            <p class="mb-4 fs-5 lh-lg">لم تنتهِ من جميع الأذكار بعد، هل تريد المغادرة؟</p>
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-primary" @click="cancel">البقاء</button>
              <button class="btn btn-danger" @click="confirm">مغادرة</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
