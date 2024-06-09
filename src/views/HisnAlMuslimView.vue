<script setup>
import { ref, computed } from 'vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import hisnAlMuslim from '@/databases/hisn-al-muslim.json'

const search = ref('')
const categories = computed(() => hisnAlMuslim.filter((item) => item.name.includes(search.value)))
</script>

<template>
  <PageLayout>
    <div class="mb-4">
      <div>
        <h1>حصن المسلم</h1>
        <p class="lead">
          كتاب حصن المسلم من أذكار الكتاب والسنة يجمع أذكار وأدعية النبي صلى الله عليه وسلم الصحيحة
          في مختلف مجالات الحياة اليومية.
        </p>
      </div>

      <div class="form-floating">
        <input v-model="search" type="search" class="form-control" placeholder="ابحث عن الباب" />
        <label>تبحث عن باب معين؟</label>
      </div>
    </div>

    <ul class="list-group">
      <li v-for="(item, index) in categories" :key="index" class="list-group-item py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span>{{ index + 1 }}. {{ item.name }}</span>
        </div>
      </li>

      <li v-if="categories.length === 0" class="list-group-item py-5 text-center">
        <IconMoodEmpty size="2.5rem" />
        <p class="mt-2">لا توجد نتائج مطابقة لعملية البحث</p>
      </li>
    </ul>
  </PageLayout>
</template>
