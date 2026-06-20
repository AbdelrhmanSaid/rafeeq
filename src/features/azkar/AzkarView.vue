<script setup>
import { useSearch } from '@/shared/composables/useSearch'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import FavoriteList from '@/shared/ui/FavoriteList.vue'
import categories from '@/features/azkar/data/categories.js'
import { toArabicNumerals } from '@/shared/utils/arabic'

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
