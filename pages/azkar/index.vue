<script setup>
import { IconChevronLeft } from '@tabler/icons-vue'
import categories from '~/exports/AzkarCategories.js'

const { search, filtered } = useSearch(categories, ['name'])

useSeoMeta({
  title: 'الأذكار - رفيق',
  ogTitle: 'الأذكار - رفيق',
  description: 'مجموعة شاملة من الأذكار اليومية للمسلم: أذكار الصباح والمساء، أذكار النوم، وأدعية من الكتاب والسنة.',
  ogDescription: 'مجموعة شاملة من الأذكار اليومية للمسلم: أذكار الصباح والمساء، أذكار النوم، وأدعية من الكتاب والسنة.',
  keywords: 'أذكار, أدعية, حصن المسلم, أذكار الصباح, أذكار المساء',
})
</script>

<template>
  <Page>
    <Heading title="الأذكار" subtitle="اختر الباب الذي ترغب في البحث عن الأذكار المتعلقة به" />

    <div class="form-floating mb-4">
      <input v-model="search" type="text" class="form-control" placeholder="ابحث عن الباب" />
      <label>تبحث عن باب معين؟</label>
    </div>

    <ul class="list-group">
      <li v-for="category in filtered" :key="category.slug" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span>{{ category.name }}</span>

          <NuxtLink
            :to="`/azkar/${category.slug}`"
            class="btn btn-flat stretched-link"
          >
            <IconChevronLeft size="1.25rem" />
          </NuxtLink>
        </div>
      </li>

      <li v-if="filtered.length === 0" class="list-group-item">
        <EmptyState />
      </li>
    </ul>
  </Page>
</template>

