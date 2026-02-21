<script setup>
import { useRadioStore } from '@/stores/radio'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { useSearch } from '@/composables/search'
import { computed } from 'vue'
import { useOnline } from '@vueuse/core'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import FavoriteList from '@/components/FavoriteList.vue'
import radiosData from '@/exports/Radios.js'
import OfflineState from '@/components/OfflineState.vue'

const store = useRadioStore()
const online = useOnline()

const radiosList = computed(() =>
  Object.entries(radiosData).map(([slug, station]) => ({
    slug,
    ...station,
  })),
)

const { search, filtered } = useSearch(radiosList, ['name'])
</script>

<template>
  <Page v-if="!online">
    <OfflineState />
  </Page>

  <Page v-else>
    <Heading title="الإذاعة" subtitle="استمع لإذاعات القرآن الكريم المختلفة حول العالم" :share="true" />

    <div class="form-floating mb-4">
      <input v-model="search" type="search" class="form-control" placeholder="ابحث عن إذاعة" />
      <label>تبحث عن إذاعة معينة؟</label>
    </div>

    <FavoriteList
      :items="filtered"
      :search="search"
      item-key="slug"
      favorites-key="radioFavorites"
      :item-class="(item) => ({ active: store.station === item.url })"
    >
      <template #favorites-title>
        <h5 class="mb-3">الإذاعات المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3">كل الإذاعات</h5>
      </template>

      <template #default="{ item, index }">
        <RouterLink :to="{ name: 'radio-station', params: { slug: item.slug } }" class="flex-grow-1 radio-link">
          {{ index + 1 }}. {{ item.name }}
        </RouterLink>
      </template>

      <template #actions="{ item }">
        <button class="btn btn-flat" @click.stop="store.stop()" v-if="store.station === item.url">
          <IconPlayerPause size="1.25rem" />
        </button>

        <button class="btn btn-flat" @click.stop="store.play(item.url)" v-else>
          <IconPlayerPlay size="1.25rem" />
        </button>
      </template>
    </FavoriteList>
  </Page>
</template>

<style lang="scss" scoped>
.radio-link {
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.list-group-item) {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;

  &.active {
    background-color: var(--bs-primary);
    color: var(--bs-white);

    button {
      color: var(--bs-white);
    }
  }

  &:hover:not(.active) {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
  }
}
</style>
