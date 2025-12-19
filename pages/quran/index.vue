<script setup>
import { IconChevronLeft } from '@tabler/icons-vue'
import surahs from '~/exports/QuranSurahs.js'

const { search, filtered } = useSearch(surahs, ['name'])

useSeoMeta({
  title: 'القرآن الكريم - رفيق',
  ogTitle: 'القرآن الكريم - رفيق',
  description: 'تصفح واستمع إلى سور القرآن الكريم كاملة مع مجموعة متنوعة من القراء.',
  ogDescription: 'تصفح واستمع إلى سور القرآن الكريم كاملة مع مجموعة متنوعة من القراء.',
  keywords: 'القرآن الكريم, تلاوة, قراء, سور, استماع',
})
</script>

<template>
  <Page>
    <Heading
      title="القرآن الكريم"
      subtitle="إن له لحلاوة، وإن عليه لطلاوة، وإن أعلاه لمثمر، وإن أسفله لمغدق، وإنه يعلو ولا يعلى عليه."
    />

    <div class="form-floating mb-4">
      <input v-model="search" type="text" class="form-control" placeholder="ابحث بالسورة" />
      <label>تبحث عن سورة معينة؟</label>
    </div>

    <ul class="list-group">
      <li v-for="surah in filtered" :key="surah.id" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <p class="d-flex flex-column m-0">
            <span>{{ surah.id }}. {{ surah.name }}</span>
            <small> عدد الآيات: {{ surah.numberOfAyahs }} - {{ surah.isMeccan ? 'مكية' : 'مدنية' }} </small>
          </p>

          <NuxtLink :to="`/quran/${surah.id}`" class="btn btn-flat stretched-link">
            <IconChevronLeft size="1.25rem" />
          </NuxtLink>
        </div>
      </li>

      <li v-if="filtered.length === 0" class="list-group-item">
        <EmptyState />
      </li>
    </ul>
  </Page>
</template>

