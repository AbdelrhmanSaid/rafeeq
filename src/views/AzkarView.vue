<script setup>
import { RouterLink } from 'vue-router'
import { IconHeart, IconHeartFilled } from '@tabler/icons-vue'
import { useSearch } from '@/composables/search'
import { useFavorites } from '@/composables/favorites'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import EmptyState from '@/components/EmptyState.vue'
import categories from '@/exports/AzkarCategories.js'

categories.forEach((category, index) => {
  category.id = index + 1
})

const { isFavorite, toggleFavorite, filterFavorites } = useFavorites('azkarFavorites')
const { search, filtered } = useSearch(categories, ['name'])
const favorites = filterFavorites(categories, (c) => c.slug)
</script>

<template>
  <Page>
    <Heading title="الأذكار" subtitle="اختر الباب الذي ترغب في البحث عن الأذكار المتعلقة به" :share="true" />

    <div class="form-floating mb-4">
      <input v-model="search" type="text" class="form-control" placeholder="ابحث عن الباب" />
      <label>تبحث عن باب معين؟</label>
    </div>

    <div v-if="favorites.length && !search" class="mb-4">
      <h5 class="mb-3">الأبواب المفضلة</h5>
      <ul class="list-group">
        <li v-for="category in favorites" :key="category.slug" class="list-group-item list-group-item-action py-3">
          <div class="d-flex justify-content-between align-items-center">
            <RouterLink
              :to="{ name: 'azkar-category', params: { category: category.slug } }"
              class="stretched-link text-decoration-none text-reset"
            >
              {{ category.id }}. {{ category.name }}
            </RouterLink>

            <button class="btn btn-flat position-relative z-1" @click="toggleFavorite(category.slug)" title="إزالة من المفضلة">
              <IconHeartFilled size="1.25rem" class="text-danger" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <h5 v-if="favorites.length && !search" class="mb-3">كل الأبواب</h5>
    <ul class="list-group">
      <li v-for="category in filtered" :key="category.slug" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <RouterLink
            :to="{ name: 'azkar-category', params: { category: category.slug } }"
            class="stretched-link text-decoration-none text-reset"
          >
            {{ category.id }}. {{ category.name }}
          </RouterLink>

          <button
            class="btn btn-flat position-relative z-1"
            @click="toggleFavorite(category.slug)"
            :title="isFavorite(category.slug) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
          >
            <IconHeartFilled v-if="isFavorite(category.slug)" size="1.25rem" class="text-danger" />
            <IconHeart v-else size="1.25rem" />
          </button>
        </div>
      </li>

      <li v-if="filtered.length === 0" class="list-group-item">
        <EmptyState />
      </li>
    </ul>
  </Page>
</template>
