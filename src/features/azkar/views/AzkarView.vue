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
        <h5 class="mb-3">الأبواب المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3">كل الأبواب</h5>
      </template>

      <template #default="{ item }">
        <RouterLink
          :to="{ name: 'azkar-category', params: { category: item.slug } }"
          class="stretched-link text-decoration-none text-reset d-flex align-items-center gap-2 min-w-0 flex-grow-1"
        >
          <span class="row-index">{{ toArabicNumerals(item.id) }}.</span>
          <span class="text-truncate">{{ item.name }}</span>
        </RouterLink>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>

<style lang="scss" scoped>
/* Quiet fixed-width index column so category names align vertically. */
.row-index {
  width: 2.25rem;
  flex-shrink: 0;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  color: var(--bs-secondary-color);
}
</style>
