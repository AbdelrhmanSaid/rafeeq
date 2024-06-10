<script setup>
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import EmptyState from '@/components/EmptyState.vue'

import surahs from '@/exports/QuranSurahs.js'
import { useSearch } from '@/composables/search'
import { toArabicNumber, matchNumber } from '@/utilities/arabic'

const { search, filtered } = useSearch(surahs, ['name'])
</script>

<template>
  <PageLayout>
    <div class="mb-4">
      <div>
        <h1>القرآن الكريم</h1>
        <p class="lead">إن له لحلاوة، وإن عليه لطلاوة، وإن أعلاه لمثمر، وإن أسفله لمغدق، وإنه يعلو ولا يعلى عليه.</p>
      </div>

      <div class="form-floating">
        <input v-model="search" type="text" class="form-control" placeholder="ابحث بالسورة" />
        <label>تبحث عن سورة معينة؟</label>
      </div>
    </div>

    <ul class="list-group">
      <li v-for="surah in filtered" :key="surah.id" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <p class="d-flex flex-column m-0">
            <span>{{ toArabicNumber(surah.id) }}. {{ surah.name }}</span>
            <small>
              {{ toArabicNumber(surah.numberOfAyahs) }} {{ matchNumber(surah.numberOfAyahs, 'آية', 'آيات') }}
              -
              {{ surah.isMeccan ? 'مكية' : 'مدنية' }}
            </small>
          </p>

          <RouterLink :to="{ name: 'quran-surah', params: { surah: surah.id } }" class="btn btn-flat stretched-link">
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
