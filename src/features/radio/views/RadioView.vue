<script setup>
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { computed } from 'vue'
import { useOnline } from '@vueuse/core'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
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
</script>

<template>
  <Page v-if="!online">
    <OfflineState />
  </Page>

  <Page v-else>
    <Heading title="الإذاعة" subtitle="استمع لإذاعات القرآن الكريم المختلفة حول العالم" :share="true" />

    <SearchableFavoritesList
      :items="radiosList"
      item-key="slug"
      :favorites-key="STORAGE_KEYS.radioFavorites"
      search-type="search"
      placeholder="ابحث عن إذاعة"
      label="تبحث عن إذاعة معينة؟"
      :item-class="(item) => ({ active: store.station === item.url })"
    >
      <template #favorites-title>
        <h5 class="mb-3">الإذاعات المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3">كل الإذاعات</h5>
      </template>

      <template #default="{ item, index }">
        <RouterLink
          :to="{ name: 'radio-station', params: { slug: item.slug } }"
          class="flex-grow-1 radio-link d-flex align-items-center gap-3 min-w-0"
        >
          <span class="list-index">{{ toArabicNumerals(index + 1) }}</span>
          <span class="fw-medium text-truncate">{{ item.name }}</span>
        </RouterLink>
      </template>

      <template #actions="{ item }">
        <button
          v-if="store.station === item.url"
          type="button"
          class="btn btn-flat btn-icon"
          :aria-label="`إيقاف ${item.name}`"
          @click.stop="store.stop()"
        >
          <IconPlayerPause size="1.25rem" />
        </button>

        <button
          v-else
          type="button"
          class="btn btn-flat btn-icon"
          :aria-label="`تشغيل ${item.name}`"
          @click.stop="store.play(item.url, item)"
        >
          <IconPlayerPlay size="1.25rem" />
        </button>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>

<style lang="scss" scoped>
.radio-link {
  color: inherit;
  text-decoration: none;
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
