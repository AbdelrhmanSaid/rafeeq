<script setup>
import { useRadioStore } from '@/stores/radio'
import { IconPlayerPlay, IconPlayerPause, IconHeart, IconHeartFilled } from '@tabler/icons-vue'
import { useSearch } from '@/composables/search'
import { useFavorites } from '@/composables/favorites'
import { computed } from 'vue'
import { useOnline } from '@vueuse/core'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import EmptyState from '@/components/EmptyState.vue'
import radiosData from '@/exports/Radios.js'
import OfflineState from '@/components/OfflineState.vue'

const store = useRadioStore()
const online = useOnline()
const { isFavorite, toggleFavorite, filterFavorites } = useFavorites('radioFavorites')

const radiosList = computed(() =>
  Object.entries(radiosData).map(([slug, station]) => ({
    slug,
    ...station,
  })),
)

const { search, filtered } = useSearch(radiosList, ['name'])
const favorites = filterFavorites(radiosList, (r) => r.slug)
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

    <div v-if="favorites.length && !search" class="mb-4">
      <h5 class="mb-3">الإذاعات المفضلة</h5>
      <ul class="list-group">
        <li
          v-for="(station, index) in favorites"
          :key="station.slug"
          class="list-group-item py-3"
          :class="{ active: store.station === station.url }"
        >
          <div class="d-flex justify-content-between align-items-center">
            <RouterLink :to="{ name: 'radio-station', params: { slug: station.slug } }" class="flex-grow-1 radio-link">
              {{ index + 1 }}. {{ station.name }}
            </RouterLink>

            <div class="d-flex gap-2">
              <button
                class="btn btn-flat"
                @click.stop="toggleFavorite(station.slug)"
                title="إزالة من المفضلة"
              >
                <IconHeartFilled size="1.25rem" class="text-danger" />
              </button>

              <button class="btn btn-flat" @click.stop="store.stop()" v-if="store.station === station.url">
                <IconPlayerPause size="1.25rem" />
              </button>

              <button class="btn btn-flat" @click.stop="store.play(station.url)" v-else>
                <IconPlayerPlay size="1.25rem" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <h5 v-if="favorites.length && !search" class="mb-3">كل الإذاعات</h5>
    <ul class="list-group">
      <li
        v-for="(station, index) in filtered"
        :key="station.slug"
        class="list-group-item py-3"
        :class="{ active: store.station === station.url }"
      >
        <div class="d-flex justify-content-between align-items-center">
          <RouterLink :to="{ name: 'radio-station', params: { slug: station.slug } }" class="flex-grow-1 radio-link">
            {{ index + 1 }}. {{ station.name }}
          </RouterLink>

          <div class="d-flex gap-2">
            <button
              class="btn btn-flat"
              @click.stop="toggleFavorite(station.slug)"
              :title="isFavorite(station.slug) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
            >
              <IconHeartFilled v-if="isFavorite(station.slug)" size="1.25rem" class="text-danger" />
              <IconHeart v-else size="1.25rem" />
            </button>

            <button class="btn btn-flat" @click.stop="store.stop()" v-if="store.station === station.url">
              <IconPlayerPause size="1.25rem" />
            </button>

            <button class="btn btn-flat" @click.stop="store.play(station.url)" v-else>
              <IconPlayerPlay size="1.25rem" />
            </button>
          </div>
        </div>
      </li>

      <li v-if="filtered.length === 0" class="list-group-item">
        <EmptyState />
      </li>
    </ul>
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

.list-group-item {
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
