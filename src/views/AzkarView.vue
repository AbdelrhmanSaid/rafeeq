<script setup>
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'
import { useSearch } from '@/composables/search'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import EmptyState from '@/components/EmptyState.vue'
import categories from '@/exports/AzkarCategories.js'

const { search, filtered } = useSearch(categories, ['name'])
</script>

<template>
  <Page>
    <Heading title="الأذكار" subtitle="اختر الباب الذي ترغب في البحث عن الأذكار المتعلقة به" />

    <div class="form-floating mb-4">
      <input v-model="search" type="text" class="form-control" placeholder="ابحث عن الباب" />
      <label>تبحث عن باب معين؟</label>
    </div>

    <ul class="list-group">
      <li v-for="category in filtered" :key="category.id" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span>{{ category.id }}. {{ category.name }}</span>

          <RouterLink
            :to="{ name: 'azkar-category', params: { category: category.id } }"
            class="btn btn-flat stretched-link"
          >
            <IconChevronLeft size="1.25rem" />
          </RouterLink>
        </div>
      </li>

      <li v-if="filtered.length === 0" class="list-group-item">
        <EmptyState />
      </li>
    </ul>
  </Page>
</template>
