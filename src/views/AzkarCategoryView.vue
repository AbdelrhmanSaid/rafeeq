<script setup>
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'
import { useFetch } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ZekrCard from '@/components/ZekrCard.vue'
import categories from '@/exports/AzkarCategories.js'
import { useMeta } from '@/utilities/head'

const categoryParam = useRouteParams('category')

// Resolve slug to numeric id if needed
const categoryEntry = categories.find(
  (c) => String(c.id) === String(categoryParam.value) || c.slug === categoryParam.value,
)
const resolvedId = categoryEntry ? categoryEntry.id : categoryParam.value

const { isFetching, data: category, error, onFetchResponse } = useFetch(`/data/azkar/${resolvedId}.json`).json().get()

onFetchResponse(() => {
  useMeta({
    title: category.value.meta.name,
    description: category.value.meta.description,
    keywords: ['أذكار', 'دعاء', category.value.meta.name, 'رفيق'],
  })
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
    <Heading class="mb-4" :title="category.meta.name" :subtitle="category.meta.description" />

    <ZekrCard
      class="mb-3"
      v-for="(zekr, index) in category.content"
      :key="index"
      :text="zekr.text"
      :repeat="zekr.repeat"
      :reference="zekr.reference"
      :benefit="zekr.benefit"
    />

    <div class="d-flex justify-content-center">
      <RouterLink :to="{ name: 'azkar' }" class="btn btn-primary">
        <IconChevronLeft size="1.25rem" />
      </RouterLink>
    </div>
  </Page>
</template>
