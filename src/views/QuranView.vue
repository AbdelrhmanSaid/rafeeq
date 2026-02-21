<script setup>
import { RouterLink } from 'vue-router'
import { IconHeart, IconHeartFilled } from '@tabler/icons-vue'
import { useSearch } from '@/composables/search'
import { useFavorites } from '@/composables/favorites'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import EmptyState from '@/components/EmptyState.vue'
import surahs from '@/exports/QuranSurahs.js'

const { isFavorite, toggleFavorite, filterFavorites } = useFavorites('quranFavorites')
const { search, filtered } = useSearch(surahs, ['name'])
const favorites = filterFavorites(surahs, (s) => s.id)
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

    <div v-if="favorites.length && !search" class="mb-4">
      <h5 class="mb-3">السور المفضلة</h5>
      <ul class="list-group">
        <li v-for="surah in favorites" :key="surah.id" class="list-group-item list-group-item-action py-3">
          <div class="d-flex justify-content-between align-items-center">
            <RouterLink :to="{ name: 'quran-surah', params: { surah: surah.id } }" class="stretched-link text-decoration-none text-reset">
              <p class="d-flex flex-column m-0">
                <span>{{ surah.id }}. {{ surah.name }}</span>
                <small> عدد الآيات: {{ surah.numberOfAyahs }} - {{ surah.isMeccan ? 'مكية' : 'مدنية' }} </small>
              </p>
            </RouterLink>

            <button class="btn btn-flat position-relative z-1" @click="toggleFavorite(surah.id)" title="إزالة من المفضلة">
              <IconHeartFilled size="1.25rem" class="text-danger" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <h5 v-if="favorites.length && !search" class="mb-3">كل السور</h5>
    <ul class="list-group">
      <li v-for="surah in filtered" :key="surah.id" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <RouterLink :to="{ name: 'quran-surah', params: { surah: surah.id } }" class="stretched-link text-decoration-none text-reset">
            <p class="d-flex flex-column m-0">
              <span>{{ surah.id }}. {{ surah.name }}</span>
              <small> عدد الآيات: {{ surah.numberOfAyahs }} - {{ surah.isMeccan ? 'مكية' : 'مدنية' }} </small>
            </p>
          </RouterLink>

          <button
            class="btn btn-flat position-relative z-1"
            @click="toggleFavorite(surah.id)"
            :title="isFavorite(surah.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
          >
            <IconHeartFilled v-if="isFavorite(surah.id)" size="1.25rem" class="text-danger" />
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
