<script setup>
import { useSearch } from '@/composables/search'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import FavoriteList from '@/components/FavoriteList.vue'
import surahs from '@/exports/QuranSurahs.js'
import { toArabicNumerals } from '@/utilities/arabic'

const { search, filtered } = useSearch(surahs, ['name'])
</script>

<template>
  <Page>
    <Heading
      title="القرآن الكريم"
      subtitle="إن له لحلاوة، وإن عليه لطلاوة، وإن أعلاه لمثمر، وإن أسفله لمغدق، وإنه يعلو ولا يعلى عليه."
      :share="true"
    />

    <div class="form-floating mb-4">
      <input v-model="search" type="text" class="form-control" placeholder="ابحث بالسورة" />
      <label>تبحث عن سورة معينة؟</label>
    </div>

    <FavoriteList :items="filtered" :search="search" item-key="id" favorites-key="quranFavorites">
      <template #favorites-title>
        <h5 class="mb-3">السور المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3">كل السور</h5>
      </template>

      <template #default="{ item }">
        <RouterLink :to="{ name: 'quran-surah', params: { surah: item.id } }" class="stretched-link text-decoration-none text-reset">
          <p class="d-flex flex-column m-0">
            <span>{{ toArabicNumerals(item.id) }}. {{ item.name }}</span>
            <small> عدد الآيات: {{ toArabicNumerals(item.numberOfAyahs) }} - {{ item.isMeccan ? 'مكية' : 'مدنية' }} </small>
          </p>
        </RouterLink>
      </template>
    </FavoriteList>
  </Page>
</template>
