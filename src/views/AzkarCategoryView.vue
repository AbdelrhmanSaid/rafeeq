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

const categoryId = useRouteParams('category')
const { isFetching, data: category, error } = useFetch(`/data/azkar/${categoryId.value}.json`).json().get()
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

    <RouterLink :to="{ name: 'azkar' }" class="btn btn-primary">
      <span>العودة للقائمة الرئيسية</span>
      <IconChevronLeft size="1.25rem" class="ms-2" />
    </RouterLink>
  </Page>
</template>
