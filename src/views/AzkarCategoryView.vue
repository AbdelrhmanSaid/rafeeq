<script setup>
import { ref, computed } from 'vue'
import { RouterLink, onBeforeRouteLeave } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'
import { useFetch, useConfirmDialog } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ZekrCard from '@/components/ZekrCard.vue'
import { useMeta } from '@/utilities/head'

const slug = useRouteParams('category')
const { isFetching, data: category, error, onFetchResponse } = useFetch(`/data/azkar/${slug.value}.json`).json().get()

onFetchResponse(() => {
  useMeta({
    title: category.value.meta.name,
    description: category.value.meta.description,
    keywords: ['أذكار', 'دعاء', category.value.meta.name, 'رفيق'],
  })
})

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
  <Page v-if="isFetching">
    <LoadingState />
  </Page>

  <Page v-else-if="error">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
  </Page>

  <Page v-else-if="category">
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
    />

    <div class="d-flex justify-content-center">
      <RouterLink :to="{ name: 'azkar' }" class="btn btn-primary">
        <IconChevronLeft size="1.25rem" />
      </RouterLink>
    </div>
  </Page>

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
              <button class="btn btn-outline-danger" @click="confirm">مغادرة</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
