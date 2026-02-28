<script setup>
import { useSearch } from '@/composables/search'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import FavoriteList from '@/components/FavoriteList.vue'
import categories from '@/exports/AzkarCategories.js'
import { toArabicNumerals } from '@/utilities/arabic'

categories.forEach((category, index) => {
  category.id = index + 1
})

const { search, filtered } = useSearch(categories, ['name'])
</script>

<template>
  <Page>
    <Heading title="الأذكار" subtitle="اختر الباب الذي ترغب في البحث عن الأذكار المتعلقة به" :share="true" />

    <div class="form-floating mb-4">
      <input v-model="search" type="text" class="form-control" placeholder="ابحث عن الباب" />
      <label>تبحث عن باب معين؟</label>
    </div>

    <FavoriteList :items="filtered" :search="search" item-key="slug" favorites-key="azkarFavorites">
      <template #favorites-title>
        <h5 class="mb-3">الأبواب المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3">كل الأبواب</h5>
      </template>

      <template #default="{ item }">
        <RouterLink
          :to="{ name: 'azkar-category', params: { category: item.slug } }"
          class="stretched-link text-decoration-none text-reset"
        >
          {{ toArabicNumerals(item.id) }}. {{ item.name }}
        </RouterLink>
      </template>
    </FavoriteList>
  </Page>
</template>
