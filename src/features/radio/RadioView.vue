<script setup>
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { useSearch } from '@/shared/composables/useSearch'
import { computed } from 'vue'
import { useOnline } from '@vueuse/core'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import FavoriteList from '@/shared/ui/FavoriteList.vue'
import radiosData from '@/features/radio/data/radios.js'
import OfflineState from '@/shared/ui/OfflineState.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

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
      :favorites-key="STORAGE_KEYS.radioFavorites"
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
          {{ toArabicNumerals(index + 1) }}. {{ item.name }}
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
    background-color: rgba(var(--bs-secondary-rgb), 0.1);
  }
}
</style>
