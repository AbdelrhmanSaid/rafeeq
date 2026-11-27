<script setup>
import { useRadioStore } from '@/features/radio/store'
import { IconLoader2, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { useOnline } from '@vueuse/core'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
import radiosData from '@/features/radio/data/radios.js'
import OfflineState from '@/shared/ui/OfflineState.vue'
import StationName from '@/features/radio/components/StationName.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { stationTitle } from '@/features/radio/lib/stationLabel'

const store = useRadioStore()
const online = useOnline()

const groups = [
  { key: 'general', title: null },
  { key: 'reciters', title: 'القراء' },
  { key: 'translations', title: 'الترجمات' },
]

const isConnecting = (item) => store.station === item.url && ['connecting', 'retrying'].includes(store.status)

const radiosList = Object.entries(radiosData).map(([slug, station]) => ({
  slug,
  ...station,
  title: stationTitle(station),
}))
</script>

<template>
  <Page v-if="!online">
    <OfflineState />
  </Page>

  <Page v-else>
    <Heading
      subtitle-desktop-only
      title="الإذاعة"
      subtitle="استمع لإذاعات القرآن الكريم المختلفة حول العالم"
      :share="true"
    />

    <SearchableFavoritesList
      :items="radiosList"
      item-key="slug"
      :favorites-key="STORAGE_KEYS.radioFavorites"
      search-type="search"
      :search-keys="['title', 'description']"
      placeholder="ابحث عن إذاعة"
      label="تبحث عن إذاعة معينة؟"
      :item-class="(item) => ({ active: store.station === item.url })"
      :groups="groups"
      :item-label="(item) => item.title"
    >
      <template #favorites-title>
        <h2 class="list-title">الإذاعات المفضلة</h2>
      </template>

      <template #all-title>
        <h2 class="list-title">كل الإذاعات</h2>
      </template>

      <template #default="{ item, index }">
        <RouterLink
          :to="{ name: 'radio-station', params: { slug: item.slug } }"
          class="flex-grow-1 radio-link d-flex align-items-center gap-3 min-w-0"
        >
          <span class="list-index">{{ toArabicNumerals(index + 1) }}</span>
          <StationName :name="item.name" :description="item.description" />
        </RouterLink>
      </template>

      <template #actions="{ item }">
        <button
          v-if="store.station === item.url"
          type="button"
          class="btn btn-flat btn-icon"
          :aria-label="`إيقاف ${item.title}`"
          @click.stop="store.stop()"
        >
          <IconLoader2 v-if="isConnecting(item)" size="1.25rem" class="is-spinning" />
          <IconPlayerPause v-else size="1.25rem" />
        </button>

        <button
          v-else
          type="button"
          class="btn btn-flat btn-icon"
          :aria-label="`تشغيل ${item.title}`"
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
  container-type: inline-size;
  transition:
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;

  &.active {
    background-color: var(--bs-primary);
    color: var(--app-on-primary);

    button {
      color: var(--app-on-primary);
    }

    .station-name__detail {
      color: color-mix(in srgb, var(--app-on-primary) 82%, var(--bs-primary));
    }

    .list-index {
      background: color-mix(in srgb, var(--app-on-primary) 20%, transparent);
      color: var(--app-on-primary);
    }
  }

  @container (max-width: 17em) {
    .list-index {
      display: none;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(.active) {
      background-color: rgba(var(--bs-secondary-rgb), 0.1);
    }
  }
}
</style>
