<script setup>
import { IconChevronLeft } from '@tabler/icons-vue'
import categories from '~/exports/AzkarCategories.js'

const route = useRoute()
const categoryParam = computed(() => route.params.category)

// Resolve slug to numeric id if needed
const categoryEntry = computed(() => categories.find(
  (c) => String(c.id) === String(categoryParam.value) || c.slug === categoryParam.value,
))
const resolvedId = computed(() => categoryEntry.value ? categoryEntry.value.id : categoryParam.value)

// Fetch category data
const { data: category, status, error } = await useFetch(() => `/data/azkar/${resolvedId.value}.json`)

// Set SEO meta when category is loaded
watch(category, (data) => {
  if (data) {
    useSeoMeta({
      title: `${data.meta.name} - رفيق`,
      ogTitle: `${data.meta.name} - رفيق`,
      description: data.meta.description,
      ogDescription: data.meta.description,
      keywords: `أذكار, دعاء, ${data.meta.name}, رفيق`,
    })
  }
}, { immediate: true })
</script>

<template>
  <Page v-if="status === 'pending'">
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
      <NuxtLink to="/azkar" class="btn btn-primary">
        <IconChevronLeft size="1.25rem" />
      </NuxtLink>
    </div>
  </Page>
</template>

