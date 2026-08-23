<script setup>
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
import categories from '@/features/azkar/data/categories.js'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const items = categories.map((category, index) => ({ ...category, id: index + 1 }))

// Both group headings are the same quiet label above their own list card.
const groupTitleClass = 'mb-3 px-1 text-base font-medium'
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
        <h5 :class="groupTitleClass">الأبواب المفضلة</h5>
      </template>

      <template #all-title>
        <h5 :class="groupTitleClass">كل الأبواب</h5>
      </template>

      <template #default="{ item }">
        <!-- The negative block margin pulls the link over the row's own
             padding, so the whole row height stays clickable. The index sits in
             its own muted gutter so the names line up down the list. -->
        <RouterLink
          :to="{ name: 'azkar-category', params: { category: item.slug } }"
          class="-my-3 flex min-w-0 flex-1 items-center gap-2 py-3"
        >
          <span class="w-9 shrink-0 text-sm text-muted-foreground tabular-nums">{{ toArabicNumerals(item.id) }}.</span>
          <span class="min-w-0 flex-1">{{ item.name }}</span>
        </RouterLink>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>
