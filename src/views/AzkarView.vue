<script setup>
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import EmptyState from '@/components/EmptyState.vue'

import categories from '@/exports/AzkarCategories.js'
import { useSearch } from '@/composables/search'

const { search, filtered } = useSearch(categories, ['name'])
import { toArabicNumber, matchNumber } from '@/utilities/arabic'
</script>

<template>
  <PageLayout>
    <div class="mb-4">
      <div>
        <h1>الأذكار</h1>
        <p class="lead">
          هناك {{ toArabicNumber(categories.length) }} {{ matchNumber(categories.length, 'باب', 'أبواب') }} من الأذكار.
        </p>
      </div>

      <div class="form-floating">
        <input v-model="search" type="text" class="form-control" placeholder="ابحث عن الباب" />
        <label>تبحث عن باب معين؟</label>
      </div>
    </div>

    <ul class="list-group">
      <li v-for="category in filtered" :key="category.id" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span>{{ toArabicNumber(category.id) }}. {{ category.name }}</span>

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
  </PageLayout>
</template>
