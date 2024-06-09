<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { IconChevronLeft } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import EmptyState from '@/components/EmptyState.vue'

import categories from '@/databases/hisn-al-muslim.json'

const search = ref('')
const filtered = computed(() => categories.filter((item) => item.name.includes(search.value)))
</script>

<template>
  <PageLayout>
    <div class="mb-4">
      <div>
        <h1>حصن المسلم</h1>
        <p class="lead">
          كتاب حصن المسلم من أذكار الكتاب والسنة يجمع أذكار وأدعية النبي صلى الله عليه وسلم الصحيحة في مختلف مجالات
          الحياة اليومية.
        </p>
      </div>

      <div class="form-floating">
        <input v-model="search" type="text" class="form-control" placeholder="ابحث عن الباب" />
        <label>تبحث عن باب معين؟</label>
      </div>
    </div>

    <ul class="list-group">
      <li v-for="category in filtered" :key="category.id" class="list-group-item list-group-item-action py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span>{{ category.id }}. {{ category.name }}</span>

          <RouterLink
            :to="{ name: 'hisn-al-muslim-category', params: { category: category.id } }"
            class="btn btn-flat stretched-link"
          >
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
