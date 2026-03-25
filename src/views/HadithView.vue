<script setup>
import { useSearch } from '@/composables/useSearch'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import FavoriteList from '@/components/FavoriteList.vue'
import hadiths from '@/exports/HadithList.js'
import { toArabicNumerals } from '@/utilities/arabic'

const { search, filtered } = useSearch(hadiths, ['title'])
</script>

<template>
  <Page>
    <Heading
      title="الأربعون النووية"
      subtitle="الأحاديث النووية الأربعون للإمام النووي رحمه الله"
      :share="true"
    />

    <div class="form-floating mb-4">
      <input v-model="search" type="text" class="form-control" placeholder="ابحث عن حديث" />
      <label>تبحث عن حديث معين؟</label>
    </div>

    <FavoriteList :items="filtered" :search="search" item-key="id" favorites-key="hadithFavorites">
      <template #favorites-title>
        <h5 class="mb-3">الأحاديث المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3">كل الأحاديث</h5>
      </template>

      <template #default="{ item }">
        <RouterLink
          :to="{ name: 'hadith-detail', params: { id: item.id } }"
          class="stretched-link text-decoration-none text-reset"
        >
          {{ toArabicNumerals(item.id) }}. {{ item.title }}
        </RouterLink>
      </template>
    </FavoriteList>
  </Page>
</template>
