<script setup>
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
import categories from '@/features/azkar/data/categories.js'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const items = categories.map((category, index) => ({ ...category, id: index + 1 }))
</script>

<template>
  <Page>
    <Heading title="الأذكار" subtitle="اختر الباب الذي ترغب في البحث عن الأذكار المتعلقة به" :share="true" />

    <SearchableFavoritesList
      :items="items"
      item-key="slug"
      :favorites-key="STORAGE_KEYS.azkarFavorites"
      placeholder="ابحث عن الباب"
      label="تبحث عن باب معين؟"
    >
      <template #favorites-title>
        <h5 class="mb-3 text-lg">الأبواب المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3 text-lg">كل الأبواب</h5>
      </template>

      <template #default="{ item }">
        <!-- The negative block margin pulls the link over the row's own
             padding, so the whole row height stays clickable. -->
        <RouterLink
          :to="{ name: 'azkar-category', params: { category: item.slug } }"
          class="-my-3 block min-w-0 flex-1 py-3"
        >
          {{ toArabicNumerals(item.id) }}. {{ item.name }}
        </RouterLink>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>
