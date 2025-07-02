<script setup>
import { useRadioStore } from '@/stores/radio'
import { IconPlayerPlay, IconPlayerPause, IconHeart, IconHeartFilled } from '@tabler/icons-vue'
import { useSearch } from '@/composables/search'
import { computed, ref } from 'vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import EmptyState from '@/components/EmptyState.vue'
import radiosData from '@/exports/Radios.js'

// Radio store
const store = useRadioStore()

// Favorites filter
const favoritesOnly = ref(false)
const radios = computed(() => {
  if (favoritesOnly.value) {
    return radiosData.filter((radio) => store.isFavorite(radio.id))
  }

  return radiosData
})

// Filter radios by search
const { search, filtered } = useSearch(radios, ['name'])
</script>

<template>
  <Page>
    <Heading title="الإذاعة" subtitle="استمع لإذاعات القرآن الكريم المختلفة حول العالم" />

    <div class="row g-3 mb-4">
      <div class="col">
        <div class="form-floating">
          <input v-model="search" type="search" class="form-control" placeholder="ابحث عن إذاعة" />
          <label>تبحث عن إذاعة معينة؟</label>
        </div>
      </div>

      <div class="col-auto">
        <button
          class="btn btn-outline-primary h-100"
          @click="favoritesOnly = !favoritesOnly"
          :class="{ active: favoritesOnly }"
        >
          <IconHeartFilled v-if="favoritesOnly" size="1.25rem" class="me-2" />
          <IconHeart v-else size="1.25rem" class="me-2" />
          المفضلة ({{ store.favorites.length }})
        </button>
      </div>
    </div>

    <ul class="list-group">
      <li
        v-for="station in filtered"
        :key="station.id"
        class="list-group-item py-3"
        :class="{ active: store.station === station.url }"
      >
        <div class="d-flex justify-content-between align-items-center">
          <span class="flex-grow-1">{{ station.id }}. {{ station.name }}</span>

          <div class="d-flex gap-2">
            <button
              class="btn btn-flat"
              @click.stop="store.toggleFavorite(station.id)"
              :title="store.isFavorite(station.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
            >
              <IconHeartFilled v-if="store.isFavorite(station.id)" size="1.25rem" class="text-danger" />
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

      <li v-if="filtered.length === 0 && (!favoritesOnly || store.favorites.length !== 0)" class="list-group-item">
        <EmptyState />
      </li>

      <li v-else-if="filtered.length === 0 && favoritesOnly" class="list-group-item text-center py-5">
        <IconHeart size="3rem" class="text-muted mb-3" />
        <h5 class="text-muted">لا توجد إذاعات مفضلة</h5>
        <p class="text-muted">قم بإضافة إذاعاتك المفضلة بالضغط على أيقونة القلب</p>
      </li>
    </ul>
  </Page>
</template>

<style lang="scss" scoped>
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
}
</style>
